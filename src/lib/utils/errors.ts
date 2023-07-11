import { captureException } from '@sentry/browser';
import { ScopeContext } from '@sentry/types/types/scope';
import debounce from 'lodash/debounce';

type BalancerExceptionAction = 'swap' | 'joinPool' | 'exitPool' | 'lock';

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

  debounce(() => {
    captureException(
      new Error(`${messagePrefix}: ${reason}`, { cause: error }),
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
  }, 1000);
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
