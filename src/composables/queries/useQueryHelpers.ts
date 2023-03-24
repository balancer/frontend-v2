import { UseQueryReturnType } from '@tanstack/vue-query';

export function isQueryLoading(query: UseQueryReturnType<any, any>): boolean {
  return query.isInitialLoading.value || !!query.error.value;
}
