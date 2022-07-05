import differenceInDays from 'date-fns/differenceInDays';
import { QueryObserverOptions } from 'react-query/core';
import { computed, ComputedRef, reactive } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { HistoricalPrices } from '@/services/coingecko/api/price.service';
import { coingeckoService } from '@/services/coingecko/coingecko.service';
import { singlePoolService } from '@/services/pool/single-pool.service';
import { Pool, PoolSnapshots } from '@/services/pool/types';

import useNetwork from '../useNetwork';

/**
 * TYPES
 */
interface QueryResponse {
  prices: HistoricalPrices;
  snapshots: PoolSnapshots;
}

/**
 * HELPERS
 */
export default function usePoolSnapshotsQuery(
  id: string,
  pool: ComputedRef<Pool>,
  days?: number,
  options: QueryObserverOptions<QueryResponse> = {}
) {
  /**
   * @description
   * If pool is already downloaded, we can use it instantly
   * it may be if user came to pool page from home page
   */
  const poolInfo = singlePoolService.findPool(id);

  /**
   * QUERY DEPENDENCIES
   */
  const { networkId } = useNetwork();

  /**
   * COMPUTED
   */
  const enabled = computed(() => !!pool.value?.id || !!poolInfo);

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.Snapshot(networkId, id);

  const queryFn = async () => {
    if (!pool.value && !poolInfo) throw new Error('No pool');

    let snapshots: PoolSnapshots = {};
    let prices: HistoricalPrices = {};

    const createTime = poolInfo?.createTime || pool.value?.createTime;
    const tokensList = poolInfo?.tokensList || pool.value?.tokensList;
    const shapshotDaysNum =
      days || differenceInDays(new Date(), new Date(createTime * 1000));

    /**
     * @description
     * due to coin gecko docs if we query from 1 to 90 days from current time it returns hourly data
     * @see https://www.coingecko.com/en/api/documentation
     */
    const aggregateBy = shapshotDaysNum <= 90 ? 'hour' : 'day';

    [prices, snapshots] = await Promise.all([
      coingeckoService.prices.getTokensHistorical(
        tokensList,
        shapshotDaysNum,
        1,
        aggregateBy
      ),
      balancerSubgraphService.poolSnapshots.get(id, shapshotDaysNum)
    ]);

    return { prices, snapshots };
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
