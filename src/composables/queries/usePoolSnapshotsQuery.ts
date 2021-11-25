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
import { isStablePhantom } from '../usePool';

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

    let tokens: string[] = [];

    if (
      isStablePhantom(pool.value.poolType) &&
      pool.value.linearPoolTokensAddresses != null
    ) {
      tokens = pool.value.linearPoolTokensAddresses;
    } else if (pool.value.tokenAddresses.includes(addresses.wstETH)) {
      // TODO - remove this once coingecko supports wstEth
      tokens = [...pool.value.tokenAddresses, addresses.stETH];
    } else {
      tokens = pool.value.tokenAddresses;
    }

    const [prices, snapshots] = await Promise.all([
      coingeckoService.prices.getTokensHistorical(tokens, days),
      balancerSubgraphService.poolSnapshots.get(id, days)
    ]);

    return { prices, snapshots };
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
