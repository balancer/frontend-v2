import { computed } from 'vue';
import useAuth from '@/composables/useAuth';
import i18n from '@/plugins/i18n';

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
      return i18n.global.t('enterAmount');

    if (!tokenIn?.balance || tokenIn.balance < parseFloat(tokenInAmount.value))
      return i18n.global.t('insufficientBalance');

    if (
      parseFloat(tokenOutAmount.value) == 0 ||
      tokenOutAmount.value.trim() === '' ||
      parseFloat(tokenInAmount.value) == 0 ||
      tokenInAmount.value.trim() === ''
    )
      return i18n.global.t('insufficientLiquidity');

    return '';
  });

  const errorMessage = computed(() => validationStatus.value);

  return {
    validationStatus,
    errorMessage
  };
}
