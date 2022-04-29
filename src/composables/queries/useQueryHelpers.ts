import { UseQueryResult } from 'react-query';
import { UseQueryReturnType } from 'vue-query/lib/vue/useBaseQuery';

type GenericQuery = UseQueryReturnType<
  any,
  unknown,
  UseQueryResult<any, unknown>
>;

export function isQueryLoading(query: GenericQuery): boolean {
  return query.isLoading.value || query.isIdle.value || !!query.error.value;
}
