import debounce from 'lodash/debounce';
import { captureException } from '@sentry/browser';
import { ScopeContext } from '@sentry/types/types/scope';
import { useI18n } from 'vue-i18n';
import { TransactionError } from '@/types/transactions';
import { TransactionAction } from '@/composables/useTransactions';
import { UseQueryReturnType } from '@tanstack/vue-query';
import { WalletError, WalletErrorMetadata } from '@/types';
import { configService } from '@/services/config/config.service';

interface Params {
  error: Error | unknown;
  action?: TransactionAction | 'unknown';
  msgPrefix?: string;
  context?: Partial<ScopeContext>;
  query?: UseQueryReturnType<any, any>;
}

type ErrorTags = { [key: string]: string };

export const captureBalancerException = debounce(
  _captureBalancerException,
  1000
);

function _captureBalancerException({
  error,
  action = 'unknown',
  msgPrefix = '',
  context = {},
  query,
}: Params): void {
  if (!shouldCaptureError(error, query)) return;
  console.error(error);

  const balError = getBalError(error);
  const message = formatErrorMsgForSentry(error, balError, msgPrefix);
  const _error = constructError(message, action, error);
  const metadata = (error as WalletError).metadata || {};
  const tags = getTags(action, context, balError, metadata);

  captureException(_error, {
    ...context,
    extra: {
      ...context?.extra,
      ...metadata,
      balError,
      originalError: (error as WalletError).data?.originalError,
    },
    tags,
  });
}

function formatErrorMsgForSentry(
  error,
  balError: string | null,
  msgPrefix: string
): string {
  let msg = '';
  if (typeof error.reason === 'string') {
    msg = error.reason;
  } else if (typeof error.message === 'string') {
    msg = error.message;
  } else if (typeof error.case === 'string') {
    msg = error.case;
  } else if (typeof error.cause.message === 'string') {
    msg = error.cause.message;
  } else if (typeof error === 'string') {
    msg = error;
  } else {
    msg = 'Unable to extract error message';
  }

  const balErrorStr = balError ? `BAL#${balError}` : '';

  return `${msgPrefix} ${balErrorStr} ${msg}`.replace(/\s+/g, '');
}

/**
 * Checks for BAL error code in reason and returns it if found.
 */
function getBalError(error): string | null {
  const reason: string =
    (error as { reason?: string }).reason || 'no reason available';
  const balError = reason.match(/BAL#[0-9]{3}/g);

  return balError && balError[0] ? balError[0].slice(-3) : null;
}

/**
 * Extract tags for Sentry from error.
 */
function getTags(
  action: TransactionAction | 'unknown',
  context: Partial<ScopeContext>,
  balError: string | null,
  metadata: WalletErrorMetadata
): ErrorTags {
  const tags: { [key: string]: string } = { ...context?.tags, action };

  if (balError) {
    tags.balError = balError;
  }

  if (metadata?.chainId) {
    tags.chainId = `${metadata.chainId}`;
  }

  return tags;
}

class BatchSwapError extends Error {
  name = 'BatchSwapError';
}
class JoinPoolError extends Error {
  name = 'JoinPoolError';
}
class ExitPoolError extends Error {
  name = 'ExitPoolError';
}
class CreatePoolError extends Error {
  name = 'CreatePoolError';
}
class CheckpointGaugeError extends Error {
  name = 'CheckpointGaugeError';
}
class VebalSyncError extends Error {
  name = 'VebalSyncError';
}
class ExtendLockError extends Error {
  name = 'ExtendLockError';
}
class UnlockError extends Error {
  name = 'UnlockError';
}
class StakeError extends Error {
  name = 'StakeError';
}
class UnstakeError extends Error {
  name = 'UnstakeError';
}

function constructError(
  message: string,
  action: TransactionAction | 'unknown',
  originalError: Error | unknown
) {
  switch (action) {
    case 'swap':
      return new BatchSwapError(message, { cause: originalError });
    case 'invest':
      return new JoinPoolError(message, { cause: originalError });
    case 'withdraw':
      return new ExitPoolError(message, { cause: originalError });
    case 'createPool':
      return new CreatePoolError(message, { cause: originalError });
    case 'userGaugeCheckpoint':
      return new CheckpointGaugeError(message, { cause: originalError });
    case 'sync':
      return new VebalSyncError(message, { cause: originalError });
    case 'extendLock':
      return new ExtendLockError(message, { cause: originalError });
    case 'unlock':
      return new UnlockError(message, { cause: originalError });
    case 'stake':
      return new StakeError(message, { cause: originalError });
    case 'unstake':
      return new UnstakeError(message, { cause: originalError });
    default:
      return new Error(message, { cause: originalError });
  }
}

/**
 * Checks if error has any metadata that matches given set of RegExps.
 *
 * @param {Error} error Error to check
 * @param {RegExp[]} messages Array of RegExps to match against error metadata
 */
function isErrorOfType(error: any, messages: RegExp[]): boolean {
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
    messages.some(
      msg => msg.test(error.reason) || msg.test(error.reason.toLowerCase())
    )
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

/**
 * Checks if error is caused by user rejecting/canceling the transaction.
 */
function isUserRejected(error): boolean {
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
    /user rejected signing/,
  ];

  return isErrorOfType(error, messages);
}

/**
 * Checks if error is caused by user not having enough gas.
 */
function isUserNotEnoughGas(error): boolean {
  const messages = [/insufficient funds for gas/];

  return isErrorOfType(error, messages);
}

/**
 * Checks if error is a testnet faucet refill error.
 */
function isFaucetRefillError(error): boolean {
  const messages = [
    /execution reverted: ERR_NEEDS_REFILL/,
    /execution reverted: ERR_DRIP_THROTTLE/,
  ];
  return isErrorOfType(error, messages);
}

/**
 * Checks if error is a bot associated error.
 */
function isBotError(error): boolean {
  const messages = [/ResourceExhausted/];

  return isErrorOfType(error, messages);
}

/**
 * Checks if error is caused by the user or the state of their wallet.
 */
export function isUserError(error): boolean {
  return isUserRejected(error) || isUserNotEnoughGas(error);
}

/**
 * Checks if query has already failed, if more than once, we will ignore the error.
 */
export function shouldCaptureQueryError(
  query: UseQueryReturnType<any, any> | undefined
): boolean {
  if (!query) return true;
  return query.failureCount.value <= 1;
}

/**
 * Checks if error is an error we want to send to Sentry.
 */
export function shouldCaptureError(
  error,
  query: UseQueryReturnType<any, any> | undefined
): boolean {
  return (
    !configService.isDevEnv &&
    !isUserError(error) &&
    !isFaucetRefillError(error) &&
    !isBotError(error) &&
    shouldCaptureQueryError(query)
  );
}

/**
 * Composable for formatting error messages.
 */
export function useErrorMsg() {
  const { t } = useI18n();

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

  function formatErrorMsg(error): TransactionError | null {
    if (isUserError(error)) return null;
    if (isErrorOfType(error, [/UNPREDICTABLE_GAS_LIMIT/]))
      return cannotEstimateGasError;
    if (isErrorOfType(error, [/-32010/])) return gasTooLowError;
    if (isErrorOfType(error, [/BAL#507/])) return slippageError;

    return defaultError();
  }

  return {
    formatErrorMsg,
  };
}
