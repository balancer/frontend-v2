import { QueryObserverOptions } from 'react-query/core';
import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { PoolSnapshots } from '@/services/pool/types';

import useNetwork from '../useNetwork';
import usePoolQuery from './usePoolQuery';

/**
 * HELPERS
 */
export default function usePoolSnapshotsQuery(
  id: string,
  days?: number,
  options: QueryObserverOptions<PoolSnapshots> = {}
) {
  /**
   * @description
   * If pool is already downloaded, we can use it instantly
   * it may be if user came to pool page from home page
   */
  const storedPool = poolsStoreService.findPool(id);

  /**
   * QUERY DEPENDENCIES
   */
  const { networkId } = useNetwork();
  const poolQuery = usePoolQuery(id);

  /**
   * COMPUTED
   */
  const pool = computed(() => poolQuery.data.value);
  const enabled = computed(() => !!pool.value?.id || !!storedPool);

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.Snapshot(networkId, id);

  const queryFn = async () => {
    if (!pool.value && !storedPool) throw new Error('No pool');

    const createTime = storedPool?.createTime || pool.value?.createTime || 0;
    return await balancerSubgraphService.poolSnapshots.get({
      where: {
        pool: id.toLowerCase(),
        timestamp_gt: createTime,
      },
    });
  };

  const queryOptions = reactive({
    enabled,
    ...options,
  });

  return useQuery<PoolSnapshots>(queryKey, queryFn, queryOptions);
}
