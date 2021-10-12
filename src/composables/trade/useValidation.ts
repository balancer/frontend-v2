import { computed, Ref } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '../useTokens';
import { bnum } from '@/lib/utils';

const MIN_NATIVE_ASSET_REQUIRED = 0.0001;

export enum TradeValidation {
  VALID,
  NO_ACCOUNT,
  EMPTY,
  NO_NATIVE_ASSET,
  NO_BALANCE,
  NO_LIQUIDITY
}

export default function useValidation(
  tokenInAddress: Ref<string>,
  tokenInAmount: Ref<string>,
  tokenOutAddress: Ref<string>,
  tokenOutAmount: Ref<string>
) {
  const { isWalletReady } = useWeb3();
  const { nativeAsset, balances } = useTokens();

  const noAmounts = computed(
    () =>
      !isValidTokenAmount(tokenInAmount.value) &&
      !isValidTokenAmount(tokenOutAmount.value)
  );

  const missingToken = computed(
    () => !tokenInAddress.value || !tokenOutAddress.value
  );

  const validationStatus = computed(() => {
    if (!isWalletReady) return TradeValidation.NO_ACCOUNT;

    if (noAmounts.value || missingToken.value) return TradeValidation.EMPTY;

    const nativeAssetBalance = parseFloat(balances.value[nativeAsset.address]);
    if (nativeAssetBalance < MIN_NATIVE_ASSET_REQUIRED) {
      return TradeValidation.NO_NATIVE_ASSET;
    }

    if (
      !balances.value[tokenInAddress.value] ||
      parseFloat(balances.value[tokenInAddress.value]) <
        parseFloat(tokenInAmount.value)
    )
      return TradeValidation.NO_BALANCE;

    if (
      parseFloat(tokenOutAmount.value) == 0 ||
      tokenOutAmount.value.trim() === '' ||
      parseFloat(tokenInAmount.value) == 0 ||
      tokenInAmount.value.trim() === ''
    )
      return TradeValidation.NO_LIQUIDITY;

    return TradeValidation.VALID;
  });

  function isValidTokenAmount(tokenAmount: string) {
    return bnum(tokenAmount).gt(0) && tokenAmount.trim() !== '';
  }

  const errorMessage = computed(() => validationStatus.value);

  return {
    validationStatus,
    errorMessage,
    isValidTokenAmount
  };
}
