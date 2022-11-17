import { BigNumber, parseFixed } from '@ethersproject/bignumber';
import { WeiPerEther as ONE } from '@ethersproject/constants';
import { AddressZero } from '@ethersproject/constants';
import { formatUnits } from '@ethersproject/units';
import { OrderBalance, OrderKind } from '@cowprotocol/contracts';
import { onlyResolvesLast } from 'awesome-only-resolves-last-promise';
import OldBigNumber from 'bignumber.js';
import {
  computed,
  ComputedRef,
  reactive,
  Ref,
  ref,
  toRefs,
  watchEffect,
} from 'vue';
import { useStore } from 'vuex';

import { bnum } from '@/lib/utils';
import { tryPromiseWithTimeout } from '@/lib/utils/promise';
import { ApiErrorCodes } from '@/services/gnosis/errors/OperatorError';
import { gnosisProtocolService } from '@/services/gnosis/gnosisProtocol.service';
import {
  FeeInformation,
  FeeQuoteParams,
  OrderMetaData,
  PriceQuoteParams,
} from '@/services/gnosis/types';
import { calculateValidTo, toErc20Address } from '@/services/gnosis/utils';
import useWeb3 from '@/services/web3/useWeb3';
import { Token } from '@/types';
import { TokenInfo } from '@/types/TokenList';

import useTokens from '../useTokens';
import { TradeQuote } from './types';
import {
  SubgraphPoolBase,
  SwapInfo,
  SwapTypes,
  buildRelayerCalls,
} from '@balancer-labs/sdk';
import { balancer } from '@/lib/balancer.sdk';
import useTrading from './useTrading';

const HIGH_FEE_THRESHOLD = parseFixed('0.2', 18);
const APP_DATA =
  process.env.VUE_APP_GNOSIS_APP_DATA ??
  '0xE9F29AE547955463ED535162AEFEE525D8D309571A2B18BC26086C8C35D781EB';

type State = {
  warnings: {
    highFees: boolean;
  };
  validationError: null | string;
  submissionError: null | string;
};

const state = reactive<State>({
  warnings: {
    highFees: false,
  },
  validationError: null,
  submissionError: null,
});

export type GnosisTransactionDetails = {
  tokenIn: Token;
  tokenOut: Token;
  tokenInAddress: string;
  tokenOutAddress: string;
  tokenInAmount: string;
  tokenOutAmount: string;
  exactIn: boolean;
  quote: TradeQuote;
  slippageBufferRate: number;
  order: {
    validTo: OrderMetaData['validTo'];
    partiallyFillable: OrderMetaData['partiallyFillable'];
  };
};

type Props = {
  exactIn: Ref<boolean>;
  tokenInAddressInput: Ref<string>;
  tokenInAmountInput: Ref<string>;
  tokenOutAddressInput: Ref<string>;
  tokenOutAmountInput: Ref<string>;
  tokenInAmountScaled: ComputedRef<BigNumber>;
  tokenOutAmountScaled: ComputedRef<BigNumber>;
  tokenIn: ComputedRef<TokenInfo>;
  tokenOut: ComputedRef<TokenInfo>;
  slippageBufferRate: ComputedRef<number>;
};

const PRICE_QUOTE_TIMEOUT = 10000;

const priceQuotesResolveLast = onlyResolvesLast(getPriceQuotes);
const feeQuoteResolveLast = onlyResolvesLast(getFeeQuote);

function getPriceQuotes(params: PriceQuoteParams) {
  return Promise.allSettled([
    tryPromiseWithTimeout(
      gnosisProtocolService.getPriceQuote(params),
      PRICE_QUOTE_TIMEOUT
    ),
  ]);
}

function getFeeQuote(params: FeeQuoteParams) {
  return gnosisProtocolService.getFeeQuote(params);
}

export default function useJoinExit({
  exactIn,
  tokenInAddressInput,
  tokenInAmountInput,
  tokenOutAddressInput,
  tokenOutAmountInput,
  tokenInAmountScaled,
  tokenOutAmountScaled,
  tokenIn,
  tokenOut,
  slippageBufferRate,
}: Props) {
  // COMPOSABLES
  const store = useStore();
  const { account } = useWeb3();
  const { balanceFor } = useTokens();
  const trading = useTrading(
    exactIn,
    tokenInAddressInput,
    tokenInAmountInput,
    tokenOutAddressInput,
    tokenOutAmountInput
  );

  // DATA
  const feeQuote = ref<FeeInformation | null>(null);
  const updatingQuotes = ref(false);
  const confirming = ref(false);
  const swapInfo = ref<SwapInfo | null>(null);

  // COMPUTED
  const appTransactionDeadline = computed<number>(
    () => store.state.app.transactionDeadline
  );

  const hasValidationError = computed(() => state.validationError != null);

  // METHODS
  function getFeeAmount() {
    const feeAmountInToken = feeQuote.value?.quote.feeAmount ?? '0';
    const feeAmountOutToken = tokenOutAmountScaled.value
      .mul(feeAmountInToken)
      .div(tokenInAmountScaled.value)
      .toString();

    return {
      feeAmountInToken,
      feeAmountOutToken,
    };
  }

  function getQuote(): TradeQuote {
    const { feeAmountInToken, feeAmountOutToken } = getFeeAmount();

    const maximumInAmount = tokenInAmountScaled.value
      .add(feeAmountInToken)
      .mul(parseFixed(String(1 + slippageBufferRate.value), 18))
      .div(ONE);

    const minimumOutAmount = tokenOutAmountScaled.value
      .sub(feeAmountOutToken)
      .mul(ONE)
      .div(parseFixed(String(1 + slippageBufferRate.value), 18));

    return {
      feeAmountInToken,
      feeAmountOutToken,
      maximumInAmount,
      minimumOutAmount,
    };
  }

  async function trade(successCallback?: () => void) {
    try {
      confirming.value = true;
      state.submissionError = null;

      if (!swapInfo.value) {
        return;
      }
      const relayerCallData = buildRelayerCalls(
        swapInfo.value,
        trading.sor.pools.value as SubgraphPoolBase[],
        account.value,
        balancer.contracts.relayerV4?.address ?? '',
        balancer.networkConfig.addresses.tokens.wrappedNativeAsset,
        '50',
        undefined
      );

      await balancer.contracts.relayerV4
        ?.connect(account.value)
        .callStatic.multicall(relayerCallData.rawCalls);

      if (successCallback != null) {
        successCallback();
      }
      confirming.value = false;
    } catch (e) {
      state.submissionError = (e as Error).message;
      confirming.value = false;
    }
  }

  function resetState(shouldResetFees = true) {
    state.warnings.highFees = false;
    state.validationError = null;
    state.submissionError = null;

    if (shouldResetFees) {
      feeQuote.value = null;
    }
  }

  async function handleAmountChange() {
    // Prevent quering undefined input amounts
    if (
      (exactIn.value && !tokenInAmountInput.value) ||
      (!exactIn.value && !tokenOutAmountInput.value)
    ) {
      return;
    }

    const amountToExchange = exactIn.value
      ? tokenInAmountScaled.value
      : tokenOutAmountScaled.value;

    if (amountToExchange === undefined) {
      return;
    }

    if (amountToExchange.isZero()) {
      tokenInAmountInput.value = '0';
      tokenOutAmountInput.value = '0';
      return;
    }

    updatingQuotes.value = true;
    state.validationError = null;

    let feeQuoteResult: FeeInformation | null = null;
    try {
      const feeQuoteParams: FeeQuoteParams = {
        sellToken: toErc20Address(tokenInAddressInput.value),
        buyToken: toErc20Address(tokenOutAddressInput.value),
        from: account.value || AddressZero,
        receiver: account.value || AddressZero,
        validTo: calculateValidTo(appTransactionDeadline.value),
        appData: APP_DATA,
        partiallyFillable: false,
        sellTokenBalance: OrderBalance.EXTERNAL,
        buyTokenBalance: OrderBalance.ERC20,
        kind: exactIn.value ? OrderKind.SELL : OrderKind.BUY,
      };

      if (exactIn.value) {
        feeQuoteParams.sellAmountBeforeFee = amountToExchange.toString();
      } else {
        feeQuoteParams.buyAmountAfterFee = amountToExchange.toString();
      }

      // TODO: there is a chance to optimize here and not make a new request if the fee is not expired
      feeQuoteResult = await feeQuoteResolveLast(feeQuoteParams);
    } catch (e) {
      feeQuoteResult = null;
      state.validationError = (e as Error).message;
    }

    if (feeQuoteResult != null) {
      try {
        let priceQuoteAmount: string | null = null;

        const priceQuoteParams: PriceQuoteParams = {
          sellToken: tokenInAddressInput.value,
          buyToken: tokenOutAddressInput.value,
          amount: amountToExchange.toString(),
          kind: exactIn.value ? OrderKind.SELL : OrderKind.BUY,
          fromDecimals: tokenIn.value.decimals,
          toDecimals: tokenOut.value.decimals,
        };

        const priceQuotes = await priceQuotesResolveLast(priceQuoteParams);

        const priceQuoteAmounts = priceQuotes.reduce<string[]>(
          (fulfilledPriceQuotes, priceQuote) => {
            if (
              priceQuote.status === 'fulfilled' &&
              priceQuote.value &&
              priceQuote.value.amount != null
            ) {
              fulfilledPriceQuotes.push(priceQuote.value.amount);
            }
            return fulfilledPriceQuotes;
          },
          []
        );

        if (priceQuoteAmounts.length > 0) {
          // For sell orders get the largest (max) quote. For buy orders get the smallest (min) quote.
          priceQuoteAmount = (
            exactIn.value
              ? priceQuoteAmounts.reduce((a, b) =>
                  BigNumber.from(a).gt(b) ? a : b
                )
              : priceQuoteAmounts.reduce((a, b) =>
                  BigNumber.from(a).lt(b) ? a : b
                )
          ).toString();
        }

        if (priceQuoteAmount != null) {
          feeQuote.value = feeQuoteResult;

          // When user clears the input while fee is fetching we won't be able to get the quote
          // TODO: ideally cancel all pending requests on amount getting changed / cleared
          if (
            (exactIn.value && !tokenInAmountInput.value) ||
            (!exactIn.value && !tokenOutAmountInput.value)
          ) {
            updatingQuotes.value = false;
            return;
          }

          if (exactIn.value) {
            tokenOutAmountInput.value = bnum(
              formatUnits(priceQuoteAmount, tokenOut.value.decimals)
            ).toFixed(6, OldBigNumber.ROUND_DOWN);

            const { feeAmountInToken } = getQuote();

            state.warnings.highFees = BigNumber.from(feeAmountInToken).gt(
              amountToExchange.mul(HIGH_FEE_THRESHOLD).div(ONE)
            );
          } else {
            tokenInAmountInput.value = bnum(
              formatUnits(priceQuoteAmount, tokenIn.value.decimals)
            ).toFixed(6, OldBigNumber.ROUND_DOWN);

            const { feeAmountOutToken, maximumInAmount } = getQuote();

            state.warnings.highFees = BigNumber.from(feeAmountOutToken).gt(
              amountToExchange.mul(HIGH_FEE_THRESHOLD).div(ONE)
            );

            if (account.value) {
              const priceExceedsBalance = bnum(
                formatUnits(maximumInAmount, tokenIn.value.decimals)
              ).gt(balanceFor(tokenIn.value.address));

              if (priceExceedsBalance) {
                state.validationError = ApiErrorCodes.PriceExceedsBalance;
              }
            }
          }
        }
      } catch (e) {
        console.log('[Gnosis Quotes] Failed to update quotes', e);
      }
    }

    updatingQuotes.value = false;

    // LIFECYCLE
    watchEffect(async () => {
      swapInfo.value = await balancer.sor.getSwaps(
        tokenInAddressInput.value,
        tokenOutAddressInput.value,
        SwapTypes.SwapExactIn,
        parseFixed(tokenInAmountInput.value || tokenOutAmountInput.value, 18),
        undefined,
        true
      );
    });
  }

  return {
    // methods
    trade,
    handleAmountChange,
    resetState,

    // computed
    swapInfo,
    ...toRefs(state),
    feeQuote,
    updatingQuotes,
    hasValidationError,
    confirming,
    getQuote,
  };
}
