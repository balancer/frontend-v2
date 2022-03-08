import { computed, reactive, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { Pool } from '@/services/balancer/subgraph/types';

type QueryResponse = Pool[] | undefined;

/**
 * Maybe replace this with useSubgraph call when ready.
 */
export default function useSimplePoolsQuery(
  poolIds: Ref<string[]>,
  options: QueryObserverOptions<QueryResponse> = {}
) {
  /**
   * COMPUTED
   */
  const enabled = computed(() => poolIds?.value && poolIds.value?.length > 0);

  /**
   * QUERY KEY
   */
  const queryKey = QUERY_KEYS.Gauges.Pools(poolIds);

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    if (!poolIds.value) return undefined;
    return await balancerSubgraphService.pools.get({
      where: {
        id_in: poolIds.value
      }
    });
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
