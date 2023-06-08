import { UseQueryOptions } from '@tanstack/vue-query';

/**
 * Returns a callback to be passed to vue-query retry option (see https://tanstack.com/query/v5/docs/vue/guides/query-retries)
 * That retry callback will only log errors in the last retry attempt (third one by default)
 * @param logError function to log the error (it will normally call to sentry captureError)
 *
 **/
export function logOnlyAfterLastRetryAttempt(
  logError: (error: unknown) => void
) {
  const retry: UseQueryOptions['retry'] = (
    failureCount: number,
    error: unknown
  ): boolean => {
    const defaultMaxRetryAttempts = 3;
    if (failureCount === defaultMaxRetryAttempts) {
      logError(error);
    }
    return true;
  };

  return retry;
}
