import { computed, Ref } from 'vue';

import { bnum } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';

import useTokens from '../useTokens';

export enum TradeValidation {
  VALID,
  NO_ACCOUNT,
  EMPTY,
  NO_NATIVE_ASSET,
  NO_BALANCE,
  NO_LIQUIDITY,
}

export default function useValidation(
  tokenInAddress: Ref<string>,
  tokenInAmount: Ref<string>,
  tokenOutAddress: Ref<string>,
  tokenOutAmount: Ref<string>
) {
  const { isWalletReady } = useWeb3();
  const { balances } = useTokens();

  const noAmounts = computed(
    () =>
      !isValidTokenAmount(tokenInAmount.value) &&
      !isValidTokenAmount(tokenOutAmount.value)
  );

  const missingToken = computed(
    () => !tokenInAddress.value || !tokenOutAddress.value
  );

  const exceedsBalance = computed(
    () =>
      !balances.value[tokenInAddress.value] ||
      bnum(balances.value[tokenInAddress.value]).lt(tokenInAmount.value)
  );

  /**
   * Not definitive. Only probably true if no other exceptions,
   * i.e. valid inputs, wallet connected, enough balance, etc.
   */
  const probablyNotEnoughLiquidity = computed(
    () =>
      bnum(tokenOutAmount.value).eq(0) ||
      tokenOutAmount.value.trim() === '' ||
      bnum(tokenInAmount.value).eq(0) ||
      tokenInAmount.value.trim() === ''
  );

  const validationStatus = computed(() => {
    if (noAmounts.value || missingToken.value) return TradeValidation.EMPTY;

    if (isWalletReady.value && exceedsBalance.value)
      return TradeValidation.NO_BALANCE;

    if (probablyNotEnoughLiquidity.value) return TradeValidation.NO_LIQUIDITY;

    return TradeValidation.VALID;
  });

  function isValidTokenAmount(tokenAmount: string) {
    return bnum(tokenAmount).gt(0) && tokenAmount.trim() !== '';
  }

  const errorMessage = computed(() => validationStatus.value);

  return {
    validationStatus,
    errorMessage,
    isValidTokenAmount,
  };
}
