import { BigNumber, parseFixed } from '@ethersproject/bignumber';
import { WeiPerEther as ONE } from '@ethersproject/constants';
import { AddressZero } from '@ethersproject/constants';
import { formatUnits } from '@ethersproject/units';
import { OrderBalance, OrderKind } from '@cowprotocol/contracts';
import OldBigNumber from 'bignumber.js';

import { bnum } from '@/lib/utils';
import { ApiErrorCodes } from '@/services/cowswap/errors/OperatorError';
import { cowswapProtocolService } from '@/services/cowswap/cowswapProtocol.service';
import { signOrder, UnsignedOrder } from '@/services/cowswap/signing';
import { OrderMetaData, PriceQuoteParams } from '@/services/cowswap/types';
import { calculateValidTo } from '@/services/cowswap/utils';
import useWeb3 from '@/services/web3/useWeb3';
import { Token } from '@/types';
import { TokenInfo } from '@/types/TokenList';

import useNumbers, { FNumFormats } from '../useNumbers';
import { useTokens } from '@/providers/tokens.provider';
import useTransactions from '../useTransactions';
import { SwapQuote } from './types';
import { Goals, trackGoal } from '../useFathom';
import { useI18n } from 'vue-i18n';
import { useApp } from '@/composables/useApp';
import { captureBalancerException, isUserError } from '@/lib/utils/errors';

const HIGH_FEE_THRESHOLD = parseFixed('0.2', 18);
const APP_DATA =
  import.meta.env.VITE_GNOSIS_APP_DATA ??
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

export type CowswapTransactionDetails = {
  tokenIn: Token;
  tokenOut: Token;
  tokenInAddress: string;
  tokenOutAddress: string;
  tokenInAmount: string;
  tokenOutAmount: string;
  exactIn: boolean;
  quote: SwapQuote;
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

export default function useCowswap({
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
  const { transactionDeadline } = useApp();
  const { account, getSigner } = useWeb3();
  const { addTransaction } = useTransactions();
  const { fNum } = useNumbers();
  const { balanceFor } = useTokens();
  const { t } = useI18n();

  // DATA
  const updatingQuotes = ref(false);
  const confirming = ref(false);
  const feeQuote = ref<string | null>(null);
  const latestQuoteIdx = ref<number>(0);

  // COMPUTED
  const hasValidationError = computed(() => state.validationError != null);

  // METHODS
  function getFeeAmount() {
    const feeAmountInToken = feeQuote.value ?? '0';
    const feeAmountOutToken = tokenInAmountScaled.value.isZero()
      ? '0'
      : tokenOutAmountScaled.value
          .mul(feeAmountInToken)
          .div(tokenInAmountScaled.value)
          .toString();

    return {
      feeAmountInToken,
      feeAmountOutToken,
    };
  }

  function getQuote(): SwapQuote {
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

  async function swap(successCallback?: () => void) {
    let quote;
    try {
      confirming.value = true;
      state.submissionError = null;

      quote = getQuote();

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
        validTo: calculateValidTo(transactionDeadline.value),
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

      const orderId = await cowswapProtocolService.sendSignedOrder({
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

      const summary = `${tokenInAmountEst}${fNum(
        sellAmount,
        FNumFormats.token
      )} ${tokenIn.value.symbol} -> ${tokenOutAmountEst}${fNum(
        buyAmount,
        FNumFormats.token
      )} ${tokenOut.value.symbol}`;

      const { validTo, partiallyFillable } = unsignedOrder;

      addTransaction({
        id: orderId,
        type: 'order',
        action: 'swap',
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
      trackGoal(Goals.CowswapSwap);
    } catch (error) {
      const msg = t('swapException', ['Cowswap']);

      captureBalancerException({
        error,
        action: 'swap',
        msgPrefix: msg,
        context: {
          level: 'fatal',
          extra: {
            sender: account.value,
            tokenIn: tokenIn.value,
            tokenOut: tokenOut.value,
            tokenInAmount: tokenInAmountInput.value,
            tokenOutAmount: tokenOutAmountInput.value,
            quote,
          },
        },
      });

      if (!isUserError(error)) {
        state.submissionError = msg;
      }

      confirming.value = false;
      throw error;
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
      exactIn.value
        ? (tokenOutAmountInput.value = '0')
        : (tokenInAmountInput.value = '0');
      return;
    }
    updatingQuotes.value = true;
    state.validationError = null;
    latestQuoteIdx.value += 1;
    const currentQuoteIdx = latestQuoteIdx.value;

    try {
      const priceQuoteParams: PriceQuoteParams = {
        sellToken: tokenInAddressInput.value,
        buyToken: tokenOutAddressInput.value,
        kind: exactIn.value ? OrderKind.SELL : OrderKind.BUY,
        fromDecimals: tokenIn.value.decimals,
        toDecimals: tokenOut.value.decimals,
        from: account.value || AddressZero,
        receiver: account.value || AddressZero,
        [exactIn.value ? 'sellAmountAfterFee' : 'buyAmountAfterFee']:
          amountToExchange.toString(),
        partiallyFillable: false, // Always fill or kill,
      };

      const priceQuote = await cowswapProtocolService.getPriceQuote(
        priceQuoteParams
      );

      // When user clears the input while fee is fetching we won't be able to get the quote
      if (
        (exactIn.value && !tokenInAmountInput.value) ||
        (!exactIn.value && !tokenOutAmountInput.value)
      ) {
        updatingQuotes.value = false;
        return;
      }

      // If there are multiple requests in flight, only use the last one
      if (priceQuote && currentQuoteIdx === latestQuoteIdx.value) {
        feeQuote.value = priceQuote.feeAmount;

        if (exactIn.value) {
          tokenOutAmountInput.value = bnum(
            formatUnits(priceQuote.buyAmount ?? '0', tokenOut.value.decimals)
          ).toFixed(6, OldBigNumber.ROUND_DOWN);

          const { feeAmountInToken } = getQuote();

          state.warnings.highFees = BigNumber.from(feeAmountInToken).gt(
            amountToExchange.mul(HIGH_FEE_THRESHOLD).div(ONE)
          );
        } else {
          tokenInAmountInput.value = bnum(
            formatUnits(priceQuote.sellAmount ?? '0', tokenIn.value.decimals)
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
      console.log('[CoWswap Quotes] Failed to update quotes', e);
    }

    updatingQuotes.value = false;
  }

  return {
    // methods
    swap,
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
