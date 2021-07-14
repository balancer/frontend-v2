import { computed } from 'vue';
import { ETHER } from '@/constants/tokenlists';
import useWeb3 from '@/services/web3/useWeb3';

const MIN_ETH_REQUIRED = 0.0001;

export enum TradeValidation {
  VALID,
  NO_ACCOUNT,
  EMPTY,
  NO_ETHER,
  NO_BALANCE,
  NO_LIQUIDITY
}

export default function useValidation(
  tokenInAddress,
  tokenInAmount,
  tokenOutAddress,
  tokenOutAmount,
  tokens
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

    const eth = tokens.value[ETHER.address];
    const ethBalance = parseFloat(eth.balance);
    if (ethBalance < MIN_ETH_REQUIRED) {
      return TradeValidation.NO_ETHER;
    }

    if (!tokenIn?.balance || tokenIn.balance < parseFloat(tokenInAmount.value))
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
