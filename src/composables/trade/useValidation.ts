import { computed } from 'vue';
import useAuth from '@/composables/useAuth';

export default function useValidation(
  tokenInAddress,
  tokenInAmount,
  tokenOutAddress,
  tokenOutAmount,
  tokens
) {
  const auth = useAuth();

  const errorMessage = computed(() => {
    if (!auth.isAuthenticated) return '';
    const tokenIn = tokens.value[tokenInAddress.value];

    if (
      parseFloat(tokenInAmount.value) == 0 ||
      tokenInAmount.value.trim() === ''
    )
      return 'Enter amount';
    if (!tokenIn?.balance || tokenIn.balance < tokenInAmount.value)
      return 'Not enough funds';
    if (!tokenOutAmount.value) return 'Not enough liquidity';
    return '';
  });

  return {
    errorMessage
  };
}
