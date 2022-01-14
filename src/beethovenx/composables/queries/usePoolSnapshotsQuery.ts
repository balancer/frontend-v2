import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolSnapshots } from '@/services/balancer/subgraph/types';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import {
  beethovenxService,
  HistoricalPrices
} from '@/beethovenx/services/beethovenx/beethovenx.service';
import { GqlBalancerPoolSnapshot } from '@/beethovenx/services/beethovenx/beethovenx-types';

/**
 * TYPES
 */
interface QueryResponse {
  prices: HistoricalPrices;
  snapshots: GqlBalancerPoolSnapshot[];
}

export default function usePoolSnapshotsQuery(
  id: string,
  days: number,
  options: QueryObserverOptions<QueryResponse> = {}
) {
  /**
   * QUERY DEPENDENCIES
   */
  const poolQuery = usePoolQuery(id);

  /**
   * COMPUTED
   */
  const pool = computed(() => poolQuery.data.value);
  const enabled = computed(() => !!pool.value?.id);

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.Snapshot(id);

  const queryFn = async () => {
    if (!pool.value) throw new Error('No pool');

    const prices = await beethovenxService.getHistoricalTokenPrices(
      pool.value.tokensList
    );
    const snapshots = await beethovenxService.getPoolSnapshots(id);

    return { prices, snapshots };
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
