import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';

import QUERY_KEYS from '@/constants/queryKeys';

import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolSnapshots } from '@/services/balancer/subgraph/types';
import { coingeckoService } from '@/services/coingecko/coingecko.service';
import { HistoricalPrices } from '@/services/coingecko/api/price.service';
import { configService } from '@/services/config/config.service';

import useNetwork from '../useNetwork';
import { isStablePhantom } from '../usePool';

import usePoolQuery from './usePoolQuery';

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

    let snapshots: PoolSnapshots = {};
    let prices: HistoricalPrices = {};

    const isStablePhantomPool = isStablePhantom(pool.value.poolType);

    if (isStablePhantomPool) {
      snapshots = await balancerSubgraphService.poolSnapshots.get(id, days);

      return {
        prices,
        snapshots
      };
    } else {
      let tokens = pool.value.tokenAddresses;
      if (pool.value.tokenAddresses.includes(addresses.wstETH)) {
        // TODO - remove this once coingecko supports wstEth
        tokens = [...pool.value.tokenAddresses, addresses.stETH];
      }

      [prices, snapshots] = await Promise.all([
        coingeckoService.prices.getTokensHistorical(tokens, days),
        balancerSubgraphService.poolSnapshots.get(id, days)
      ]);
    }

    return { prices, snapshots };
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
