import { computed, ComputedRef, Ref } from 'vue';

import useWeb3 from '@/services/web3/useWeb3';
import { configService } from '@/services/config/config.service';

import { TokenMap } from '@/types';

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
  tokenOutAmount: Ref<string>,
  tokens: ComputedRef<TokenMap>
) {
  const { isWalletReady } = useWeb3();

  const tokensAmountsValid = computed(
    () =>
      isValidTokenAmount(tokenInAmount.value) &&
      isValidTokenAmount(tokenOutAmount.value)
  );

  const validationStatus = computed(() => {
    if (!isWalletReady) return TradeValidation.NO_ACCOUNT;
    const tokenIn = tokens.value[tokenInAddress.value];

    if (!tokensAmountsValid.value) return TradeValidation.EMPTY;

    const nativeAsset = tokens.value[configService.network.nativeAsset.address];
    const nativeAssetBalance = parseFloat(nativeAsset.balance);
    if (nativeAssetBalance < MIN_NATIVE_ASSET_REQUIRED) {
      return TradeValidation.NO_NATIVE_ASSET;
    }

    if (
      !tokenIn?.balance ||
      parseFloat(tokenIn.balance) < parseFloat(tokenInAmount.value)
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
    return parseFloat(tokenAmount) > 0 && tokenAmount.trim() !== '';
  }

  const errorMessage = computed(() => validationStatus.value);

  return {
    validationStatus,
    errorMessage,
    isValidTokenAmount,
    tokensAmountsValid
  };
}
