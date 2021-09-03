import { computed, ComputedRef, reactive, ref, Ref, toRefs } from 'vue';
import { useStore } from 'vuex';
import { BigNumber } from 'bignumber.js';
import { formatUnits } from '@ethersproject/units';
import { OrderBalance, OrderKind } from '@gnosis.pm/gp-v2-contracts';
import { onlyResolvesLast } from 'awesome-only-resolves-last-promise';

import { tryPromiseWithTimeout } from '@/lib/utils/promise';
import { bnum } from '@/lib/utils';
import {
  FeeInformation,
  OrderMetaData,
  PriceQuoteParams
} from '@/services/gnosis/types';
import { signOrder, UnsignedOrder } from '@/services/gnosis/signing';
import useWeb3 from '@/services/web3/useWeb3';
import { calculateValidTo } from '@/services/gnosis/utils';
import { gnosisProtocolService } from '@/services/gnosis/gnosisProtocol.service';
import { match0xService } from '@/services/gnosis/match0x.service';
import { paraSwapService } from '@/services/gnosis/paraswap.service';

import useTransactions from '../useTransactions';

import { Token } from '@/types';
import { TokenInfo } from '@/types/TokenList';

import { TradeQuote } from './types';

import useNumbers from '../useNumbers';
import useTokens from '../useTokens';

const HIGH_FEE_THRESHOLD = 0.2;

const state = reactive({
  validationErrors: {
    feeExceedsPrice: false,
    priceExceedsBalance: false
  },
  warnings: {
    highFees: false
  },
  submissionError: null
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
const feeQuotesResolveLast = onlyResolvesLast(getFeeQuote);

function getPriceQuotes(queryParams: PriceQuoteParams) {
  return Promise.allSettled([
    tryPromiseWithTimeout(
      gnosisProtocolService.getPriceQuote(queryParams),
      PRICE_QUOTE_TIMEOUT
    ),
    tryPromiseWithTimeout(
      match0xService.getPriceQuote(queryParams),
      PRICE_QUOTE_TIMEOUT
    ),
    tryPromiseWithTimeout(
      paraSwapService.getPriceQuote(queryParams),
      PRICE_QUOTE_TIMEOUT
    )
  ]);
}

function getFeeQuote(queryParams: PriceQuoteParams) {
  return gnosisProtocolService.getFeeQuote(queryParams);
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
  slippageBufferRate
}: Props) {
  // COMPOSABLES
  const store = useStore();
  const { account, getSigner } = useWeb3();
  const { addTransaction } = useTransactions();
  const { fNum } = useNumbers();
  const { balanceFor } = useTokens();

  // DATA
  const feeQuote = ref<FeeInformation | null>(null);
  const updatingQuotes = ref(false);
  const confirming = ref(false);

  // COMPUTED
  const appTransactionDeadline = computed<number>(
    () => store.state.app.transactionDeadline
  );

  const hasValidationErrors = computed(() =>
    Object.values(state.validationErrors).some(hasError => hasError)
  );

  // METHODS
  function getFeeAmount() {
    const feeAmountInToken = feeQuote.value?.amount ?? '0';
    const feeAmountOutToken = tokenOutAmountScaled.value
      .div(tokenInAmountScaled.value)
      .times(feeAmountInToken)
      .integerValue(BigNumber.ROUND_DOWN)
      .toString();

    return {
      feeAmountInToken,
      feeAmountOutToken
    };
  }

  function getQuote(): TradeQuote {
    const { feeAmountInToken, feeAmountOutToken } = getFeeAmount();

    const maximumInAmount = tokenInAmountScaled.value
      .plus(feeAmountInToken)
      .times(1 + slippageBufferRate.value)
      .integerValue(BigNumber.ROUND_DOWN)
      .toString();

    const minimumOutAmount = tokenOutAmountScaled.value
      .minus(feeAmountOutToken)
      .div(1 + slippageBufferRate.value)
      .integerValue(BigNumber.ROUND_DOWN)
      .toString();

    return {
      feeAmountInToken,
      feeAmountOutToken,
      maximumInAmount,
      minimumOutAmount
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
        sellAmount: bnum(
          exactIn.value ? tokenInAmountScaled.value : quote.maximumInAmount
        )
          .minus(quote.feeAmountInToken)
          .toString(),
        buyAmount: exactIn.value
          ? quote.minimumOutAmount
          : tokenOutAmountScaled.value.toString(),
        validTo: calculateValidTo(appTransactionDeadline.value),
        appData:
          '0xE9F29AE547955463ED535162AEFEE525D8D309571A2B18BC26086C8C35D781EB',
        feeAmount: quote.feeAmountInToken,
        kind: exactIn.value ? OrderKind.SELL : OrderKind.BUY,
        receiver: account.value,
        partiallyFillable: false, // Always fill or kill,
        sellTokenBalance: OrderBalance.EXTERNAL
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
          signingScheme
        },
        owner: account.value
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

      const summary = `${tokenInAmountEst}${fNum(sellAmount, 'token')} ${
        tokenIn.value.symbol
      } -> ${tokenOutAmountEst}${fNum(buyAmount, 'token')} ${
        tokenOut.value.symbol
      }`;

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
            partiallyFillable
          }
        }
      });

      if (successCallback != null) {
        successCallback();
      }
      confirming.value = false;
    } catch (e) {
      state.submissionError = e.message;
      confirming.value = false;
    }
  }

  function resetState(shouldResetFees = true) {
    state.validationErrors.feeExceedsPrice = false;
    state.validationErrors.priceExceedsBalance = false;

    state.warnings.highFees = false;

    state.submissionError = null;

    if (shouldResetFees) {
      feeQuote.value = null;
    }
  }

  async function handleAmountChange() {
    const amountToExchange = exactIn.value
      ? tokenInAmountScaled.value
      : tokenOutAmountScaled.value;

    if (amountToExchange.isZero()) {
      tokenInAmountInput.value = '0';
      tokenOutAmountInput.value = '0';
      return;
    }

    if (amountToExchange.isNaN()) {
      tokenInAmountInput.value = '';
      tokenOutAmountInput.value = '';
      return;
    }

    updatingQuotes.value = true;

    try {
      const queryParams = {
        sellToken: tokenInAddressInput.value,
        buyToken: tokenOutAddressInput.value,
        amount: amountToExchange.toString(),
        kind: exactIn.value ? OrderKind.SELL : OrderKind.BUY,
        fromDecimals: tokenIn.value.decimals,
        toDecimals: tokenOut.value.decimals
      };

      // TODO: there is a chance to optimize here and not make a new request if the fee is not expired
      const feeQuoteResult = await feeQuotesResolveLast(queryParams);

      if (feeQuoteResult != null) {
        if (exactIn.value) {
          state.validationErrors.feeExceedsPrice = amountToExchange
            .minus(feeQuoteResult.amount)
            .isNegative();
        }
        if (!state.validationErrors.feeExceedsPrice) {
          let priceQuoteAmount: string | null = null;

          const priceQuotes = await priceQuotesResolveLast(queryParams);

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
            priceQuoteAmount = (exactIn.value
              ? BigNumber.max(...priceQuoteAmounts)
              : BigNumber.min(...priceQuoteAmounts)
            ).toString(10);
          }

          if (priceQuoteAmount != null) {
            feeQuote.value = feeQuoteResult;

            if (exactIn.value) {
              tokenOutAmountInput.value = bnum(
                formatUnits(priceQuoteAmount, tokenOut.value.decimals)
              ).toFixed(6, BigNumber.ROUND_DOWN);

              const { feeAmountInToken } = getQuote();

              state.warnings.highFees = bnum(feeAmountInToken)
                .div(amountToExchange)
                .gt(HIGH_FEE_THRESHOLD);
            } else {
              tokenInAmountInput.value = bnum(
                formatUnits(priceQuoteAmount, tokenIn.value.decimals)
              ).toFixed(6, BigNumber.ROUND_DOWN);

              const { feeAmountOutToken, maximumInAmount } = getQuote();

              state.warnings.highFees = bnum(feeAmountOutToken)
                .div(amountToExchange)
                .gt(HIGH_FEE_THRESHOLD);

              state.validationErrors.priceExceedsBalance = bnum(
                formatUnits(maximumInAmount, tokenIn.value.decimals)
              ).gt(balanceFor(tokenIn.value.address));
            }
          }
        }
      }
    } catch (e) {
      console.log('[Gnosis Quotes] Failed to update quotes', e);
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
    hasValidationErrors,
    confirming,
    getQuote
  };
}
