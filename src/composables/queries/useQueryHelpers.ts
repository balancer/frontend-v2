import { UseQueryReturnType } from '@tanstack/vue-query';

export function isQueryLoading(query: UseQueryReturnType<any, any>): boolean {
  return query.isLoading.value || !!query.error.value;
}
