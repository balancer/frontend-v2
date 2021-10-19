import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolSnapshots } from '@/services/balancer/subgraph/types';
import usePoolQuery from './usePoolQuery';
import { coingeckoService } from '@/services/coingecko/coingecko.service';
import { HistoricalPrices } from '@/services/coingecko/api/price.service';
import { configService } from '@/services/config/config.service';
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
const { addresses } = configService.network;

export default function usePoolSnapshotsQuery(
  id: string,
  days: number,
  options: QueryObserverOptions<QueryResponse> = {}
) {
  /**
   * QUERY DEPENDENCIES
   */
  const poolQuery = usePoolQuery(id);
  const { networkId } = useNetwork();

  /**
   * COMPUTED
   */
  const pool = computed(() => poolQuery.data.value);
  const enabled = computed(() => !!pool.value?.id);

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.Snapshot(networkId, id);

  const queryFn = async () => {
    if (!pool.value) throw new Error('No pool');

    // TODO - remove this once coingecko supports wstEth
    const tokens = pool.value.tokenAddresses.includes(addresses.wstETH)
      ? [...pool.value.tokenAddresses, addresses.stETH]
      : pool.value.tokenAddresses;

    const prices = await coingeckoService.prices.getTokensHistorical(
      tokens,
      days
    );
    const snapshots = await balancerSubgraphService.poolSnapshots.get(id, days);

    return { prices, snapshots };
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
