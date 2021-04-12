import { computed } from 'vue';
import useAuth from '@/composables/useAuth';

export enum ValidationStatus {
  VALID = '',
  EMPTY = 'Enter amount',
  INSUFFICIENT_BALANCE = 'Insufficient balance',
  INSUFFICIENT_LIQUIDITY = 'Not enough liquidity'
}

export default function useValidation(
  tokenInAddress,
  tokenInAmount,
  tokenOutAddress,
  tokenOutAmount,
  tokens
) {
  const auth = useAuth();

  const validationStatus = computed(() => {
    if (!auth.isAuthenticated) return '';
    const tokenIn = tokens.value[tokenInAddress.value];

    if (
      (parseFloat(tokenInAmount.value) == 0 ||
        tokenInAmount.value.trim() === '') &&
      (parseFloat(tokenOutAmount.value) == 0 ||
        tokenOutAmount.value.trim() === '')
    )
      return 'EMPTY';

    if (!tokenIn?.balance || tokenIn.balance < parseFloat(tokenInAmount.value))
      return 'INSUFFICIENT_BALANCE';

    if (
      parseFloat(tokenOutAmount.value) == 0 ||
      tokenOutAmount.value.trim() === '' ||
      parseFloat(tokenInAmount.value) == 0 ||
      tokenInAmount.value.trim() === ''
    )
      return 'INSUFFICIENT_LIQUIDITY';

    return 'VALID';
  });

  const errorMessage = computed(() => ValidationStatus[validationStatus.value]);

  return {
    validationStatus,
    errorMessage
  };
}
