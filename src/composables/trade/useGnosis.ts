import { computed, ComputedRef, ref, Ref } from 'vue';
import { useStore } from 'vuex';
import { BigNumber } from 'bignumber.js';
import { formatUnits } from '@ethersproject/units';
import { OrderKind } from '@gnosis.pm/gp-v2-contracts';

import { bnum } from '@/lib/utils';

import useWeb3 from '@/services/web3/useWeb3';
import { FeeInformation, OrderMetaData } from '@/services/gnosis/types';
import {
  calculateValidTo,
  signOrder,
  UnsignedOrder
} from '@/services/gnosis/signing';
import { gnosisOperator } from '@/services/gnosis/operator.service';

import useTransactions from '../useTransactions';

import { Token } from '@/types';
import { TradeQuote } from './types';
import useNumbers from '../useNumbers';

// TODO: get correct app id
const GNOSIS_APP_ID = 2;
const appData = '0x' + GNOSIS_APP_ID.toString(16).padStart(64, '0');

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
  tokenIn: ComputedRef<Token>;
  tokenOut: ComputedRef<Token>;
};

export default function useGnosis({
  exactIn,
  tokenInAddressInput,
  tokenInAmountInput,
  tokenOutAddressInput,
  tokenOutAmountInput,
  tokenInAmountScaled,
  tokenOutAmountScaled,
  tokenIn,
  tokenOut
}: Props) {
  // COMPOSABLES
  const store = useStore();
  const { account, getSigner } = useWeb3();
  const { addTransaction } = useTransactions();
  const { fNum } = useNumbers();

  // DATA
  const feeQuote = ref<FeeInformation | null>(null);
  const errors = ref({
    feeExceedsPrice: false
  });
  const updatingQuotes = ref(false);
  const trading = ref(false);

  const slippageBufferRate = computed(() =>
    parseFloat(store.state.app.slippage)
  );

  // COMPUTED
  const appTransactionDeadline = computed<number>(
    () => store.state.app.transactionDeadline
  );

  const hasErrors = computed(() =>
    Object.values(errors.value).some(hasError => hasError)
  );

  // METHODS
  function resetErrors() {
    errors.value = {
      feeExceedsPrice: false
    };
  }

  function resetFees() {
    feeQuote.value = null;
  }

  function getQuote(): TradeQuote {
    const feeAmountInToken = feeQuote.value?.amount ?? '0';
    const feeAmountOutToken = tokenOutAmountScaled.value
      .div(tokenInAmountScaled.value)
      .times(feeAmountInToken)
      .integerValue(BigNumber.ROUND_DOWN)
      .toString();

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
      trading.value = true;
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
        appData,
        feeAmount: quote.feeAmountInToken,
        kind: exactIn.value ? OrderKind.SELL : OrderKind.BUY,
        receiver: account.value,
        partiallyFillable: false // Always fill or kill
      };

      const { signature, signingScheme } = await signOrder(
        unsignedOrder,
        getSigner()
      );

      const orderId = await gnosisOperator.postSignedOrder({
        order: {
          ...unsignedOrder,
          signature,
          receiver: account.value,
          signingScheme
        },
        owner: account.value
      });

      const tokenInAmountEst = exactIn.value ? '' : '~';
      const tokenOutAmountEst = exactIn.value ? '~' : '';

      const summary = `${tokenInAmountEst}${fNum(
        tokenInAmountInput.value,
        'token'
      )} ${tokenIn.value.symbol} -> ${tokenOutAmountEst}${fNum(
        tokenOutAmountInput.value,
        'token'
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
            partiallyFillable
          }
        }
      });

      if (successCallback != null) {
        successCallback();
      }
      trading.value = false;
    } catch (e) {
      console.log(e);
      trading.value = false;
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

    resetErrors();
    updatingQuotes.value = true;

    try {
      const queryParams = {
        sellToken: tokenInAddressInput.value,
        buyToken: tokenOutAddressInput.value,
        amount: amountToExchange.toString(),
        kind: exactIn.value ? OrderKind.SELL : OrderKind.BUY
      };

      // TODO: there is a chance to optimize here and not make a new request if the fee is not expired
      const feeQuoteResult = await gnosisOperator.getFeeQuote(queryParams);

      if (feeQuoteResult != null) {
        if (exactIn.value) {
          errors.value.feeExceedsPrice = amountToExchange
            .minus(feeQuoteResult.amount)
            .isNegative();
        }
        if (!errors.value.feeExceedsPrice) {
          const priceQuoteResult = await gnosisOperator.getPriceQuote(
            queryParams
          );

          if (priceQuoteResult != null && priceQuoteResult.amount != null) {
            feeQuote.value = feeQuoteResult;

            if (exactIn.value) {
              tokenOutAmountInput.value = formatUnits(
                priceQuoteResult.amount,
                tokenOut.value.decimals
              );
            } else {
              tokenInAmountInput.value = formatUnits(
                priceQuoteResult.amount,
                tokenIn.value.decimals
              );
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
    resetErrors,
    resetFees,

    // computed
    feeQuote,
    updatingQuotes,
    errors,
    hasErrors,
    trading,
    getQuote
  };
}
