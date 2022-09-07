import { BigNumber, parseFixed } from '@ethersproject/bignumber';
import { WeiPerEther as ONE } from '@ethersproject/constants';
import { AddressZero } from '@ethersproject/constants';
import { formatUnits } from '@ethersproject/units';
import { OrderBalance, OrderKind } from '@cowprotocol/contracts';
import { onlyResolvesLast } from 'awesome-only-resolves-last-promise';
import OldBigNumber from 'bignumber.js';
import { computed, ComputedRef, reactive, Ref, ref, toRefs } from 'vue';
import { useStore } from 'vuex';

import { bnum } from '@/lib/utils';
import { tryPromiseWithTimeout } from '@/lib/utils/promise';
import { ApiErrorCodes } from '@/services/gnosis/errors/OperatorError';
import { gnosisProtocolService } from '@/services/gnosis/gnosisProtocol.service';
import { match0xService } from '@/services/gnosis/match0x.service';
import { paraSwapService } from '@/services/gnosis/paraswap.service';
import { signOrder, UnsignedOrder } from '@/services/gnosis/signing';
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

import useNumbers, { FNumFormats } from '../useNumbers';
import useTokens from '../useTokens';
import useTransactions from '../useTransactions';
import { TradeQuote } from './types';

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
    tryPromiseWithTimeout(
      match0xService.getPriceQuote(params),
      PRICE_QUOTE_TIMEOUT
    ),
    tryPromiseWithTimeout(
      paraSwapService.getPriceQuote(params),
      PRICE_QUOTE_TIMEOUT
    ),
  ]);
}

function getFeeQuote(params: FeeQuoteParams) {
  return gnosisProtocolService.getFeeQuote(params);
}

export default function useGnosis({
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
  const { account, getSigner } = useWeb3();
  const { addTransaction } = useTransactions();
  const { fNum2 } = useNumbers();
  const { balanceFor } = useTokens();

  // DATA
  const feeQuote = ref<FeeInformation | null>(null);
  const updatingQuotes = ref(false);
  const confirming = ref(false);

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

      const quote = getQuote();

      const unsignedOrder: UnsignedOrder = {
        sellToken: tokenInAddressInput.value,
        buyToken: tokenOutAddressInput.value,
        sellAmount: (exactIn.value
          ? tokenInAmountScaled.value
          : quote.maximumInAmount
        )
          .sub(quote.feeAmountInToken)
          .toString(),
        buyAmount: exactIn.value
          ? quote.minimumOutAmount.toString()
          : tokenOutAmountScaled.value.toString(),
        validTo: calculateValidTo(appTransactionDeadline.value),
        appData: APP_DATA,
        feeAmount: quote.feeAmountInToken,
        kind: exactIn.value ? OrderKind.SELL : OrderKind.BUY,
        receiver: account.value,
        partiallyFillable: false, // Always fill or kill,
        sellTokenBalance: OrderBalance.EXTERNAL,
      };

      const { signature, signingScheme } = await signOrder(
        unsignedOrder,
        getSigner()
      );

      const orderId = await gnosisProtocolService.sendSignedOrder({
        order: {
          ...unsignedOrder,
          signature,
          receiver: account.value,
          signingScheme,
        },
        owner: account.value,
      });

      const sellAmount = exactIn.value
        ? tokenInAmountInput.value
        : formatUnits(quote.maximumInAmount, tokenIn.value.decimals).toString();

      const buyAmount = exactIn.value
        ? formatUnits(
            quote.minimumOutAmount,
            tokenOut.value.decimals
          ).toString()
        : tokenOutAmountInput.value;

      const tokenInAmountEst = exactIn.value ? '' : '~';
      const tokenOutAmountEst = exactIn.value ? '~' : '';

      const summary = `${tokenInAmountEst}${fNum2(
        sellAmount,
        FNumFormats.token
      )} ${tokenIn.value.symbol} -> ${tokenOutAmountEst}${fNum2(
        buyAmount,
        FNumFormats.token
      )} ${tokenOut.value.symbol}`;

      const { validTo, partiallyFillable } = unsignedOrder;

      addTransaction({
        id: orderId,
        type: 'order',
        action: 'trade',
        summary,
        details: {
          tokenIn: tokenIn.value,
          tokenOut: tokenOut.value,
          tokenInAddress: tokenInAddressInput.value,
          tokenOutAddress: tokenOutAddressInput.value,
          tokenInAmount: tokenInAmountInput.value,
          tokenOutAmount: tokenOutAmountInput.value,
          exactIn: exactIn.value,
          quote,
          slippageBufferRate: slippageBufferRate.value,
          order: {
            validTo,
            partiallyFillable,
          },
        },
      });

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
  }

  return {
    // methods
    trade,
    handleAmountChange,
    resetState,

    // computed
    ...toRefs(state),
    feeQuote,
    updatingQuotes,
    hasValidationError,
    confirming,
    getQuote,
  };
}
