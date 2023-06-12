import { UseQueryReturnType } from '@tanstack/vue-query';

// Returns true unless vue-query already retried 3 times
// We use this function to reduce the amount of sentry captured errors as we will ignore certain random errors that only happens once
// but do not happen in the next retry
export function shouldIgnoreError(
  query: UseQueryReturnType<any, any>
): boolean {
  const defaultMaxRetries = 3;
  return query.failureCount.value < defaultMaxRetries;
}
