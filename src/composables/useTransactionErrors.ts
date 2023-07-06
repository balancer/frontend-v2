import { useI18n } from 'vue-i18n';

import { TransactionError } from '@/types/transactions';

export function isUserRejected(error): boolean {
  const messages = [
    /user rejected transaction/,
    /request rejected/,
    /user rejected methods./,
    /user rejected the transaction/,
    /rejected by user/,
    /user canceled/,
    /cancelled by user/,
    /transaction declined/,
    /transaction was rejected/,
    /user denied transaction signature/,
    /user disapproved requested methods/,
    /canceled/,
  ];

  return isErrorType(error, messages);
}

export function isUserNotEnoughGas(error): boolean {
  const messages = [/insufficient funds for gas/];

  return isErrorType(error, messages);
}

function isErrorType(error, messages: RegExp[]): boolean {
  if (!error) return false;

  if (
    typeof error === 'string' &&
    messages.some(msg => msg.test(error.toLowerCase()))
  )
    return true;

  if (
    error.message &&
    messages.some(msg => msg.test(error.message.toLowerCase()))
  )
    return true;

  if (
    typeof error.reason === 'string' &&
    messages.some(msg => msg.test(error.reason.toLowerCase()))
  )
    return true;

  if (
    error.cause?.message &&
    messages.some(msg => msg.test(error.cause.message.toLowerCase()))
  )
    return true;

  if (
    typeof error.cause === 'string' &&
    messages.some(msg => msg.test(error.cause.toLowerCase()))
  )
    return true;

  if (error.b && messages.some(msg => msg.test(error.b.toLowerCase())))
    return true;

  if (error?.code && error.code === 4001) {
    return true;
  }

  if (error.cause instanceof Error) return isUserRejected(error.cause);

  return false;
}

// Errors that are caused by the user or the state of their wallet.
export function isUserError(error): boolean {
  return isUserRejected(error) || isUserNotEnoughGas(error);
}

export default function useTransactionErrors() {
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

  /**
   * METHODS
   */
  function parseError(error): TransactionError | null {
    if (isUserError(error)) return null;
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
