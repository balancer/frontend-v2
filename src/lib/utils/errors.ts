import { captureException } from '@sentry/browser';
import { ScopeContext } from '@sentry/types/types/scope';

type BalancerExceptionAction = 'swap' | 'joinPool' | 'exitPool';

export function captureBalancerException(
  error: Error,
  action: BalancerExceptionAction,
  messagePrefix: string,
  captureContext?: Partial<ScopeContext>
): void {
  const { reason, balError } = getReasonAndBalErrorFromError(error);
  const tags: { [key: string]: string } = { ...captureContext?.tags, action };

  if (balError) {
    tags.balError = balError;
  }

  captureException(
    getErrorForAction(action, `${messagePrefix}: ${reason}`, error),
    {
      ...captureContext,
      extra: {
        ...captureContext?.extra,
        reason,
        balError,
      },
      tags,
    }
  );
}

function getReasonAndBalErrorFromError(error: Error): {
  reason: string;
  balError: string | null;
} {
  const reason: string =
    (error as { reason?: string }).reason || 'no reason available';
  const balError = reason.match(/BAL#([0-9])\d\d/g);

  return {
    reason: reason,
    balError: balError && balError[0] ? balError[0].slice(-3) : null,
  };
}

function getErrorForAction(
  action: BalancerExceptionAction,
  message: string,
  originalError: Error
) {
  switch (action) {
    case 'swap':
      return new BatchSwapError(message, { cause: originalError });
    case 'joinPool':
      return new JoinPoolError(message, { cause: originalError });
    case 'exitPool':
      return new ExitPoolError(message, { cause: originalError });
  }
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
