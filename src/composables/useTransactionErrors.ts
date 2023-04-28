import { useI18n } from 'vue-i18n';

import { TransactionError } from '@/types/transactions';

export default function useTranasactionErrors() {
  /**
   * COMPOSABLES
   */
  const { t } = useI18n();

  /**
   * ERRORS
   */
  const gasTooLowError: TransactionError = {
    title: t('transactionErrors.gasTooLow.title'),
    description: t('transactionErrors.gasTooLow.description'),
  };

  const cannotEstimateGasError: TransactionError = {
    title: t('transactionErrors.cannotEstGas.title'),
    description: t('transactionErrors.cannotEstGas.description'),
  };

  const slippageError: TransactionError = {
    title: t('transactionErrors.slippage.title'),
    description: t('transactionErrors.slippage.description'),
  };

  function defaultError(message = ''): TransactionError {
    return {
      title: t('transactionErrors.default.title'),
      description: message.trim(),
    };
  }

  function isUserRejected(error): boolean {
    console.log('cause', error.cause);
    return (
      (error?.code && error.code === 4001) ||
      (error?.message && error.message.includes('user rejected transaction')) ||
      (error?.cause &&
        error.cause.message.includes('user rejected transaction'))
    );
  }

  /**
   * METHODS
   */
  function parseError(error): TransactionError | null {
    if (isUserRejected(error)) return null; // User rejected transaction
    if (error?.code && error.code === 'UNPREDICTABLE_GAS_LIMIT')
      return cannotEstimateGasError;

    if (error?.message) {
      if (error.message.includes('-32010')) return gasTooLowError;
      if (error.message.includes('BAL#507')) return slippageError;

      return defaultError(error.message);
    }

    return defaultError();
  }

  return {
    parseError,
    isUserRejected,
  };
}
