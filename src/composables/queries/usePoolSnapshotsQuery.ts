import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';

import QUERY_KEYS from '@/constants/queryKeys';

import BalancerSubgraph from '@/services/balancer/subgraph/service';
import { PoolSnapshots } from '@/services/balancer/subgraph/types';
import useWeb3 from '../useWeb3';
import { getTokensHistoricalPrice, HistoricalPrices } from '@/api/coingecko';
import usePoolQuery from './usePoolQuery';

interface QueryResponse {
  prices: HistoricalPrices;
  snapshots: PoolSnapshots;
}

export default function usePoolSnapshotsQuery(
  id: string,
  days: number,
  options: QueryObserverOptions<QueryResponse> = {}
) {
  // COMPOSABLES
  const { appNetwork } = useWeb3();

  // SERVICES
  const balancerSubgraph = new BalancerSubgraph();

  // DEPENDENT QUERIES
  const poolQuery = usePoolQuery(id);

  // COMPUTED
  const pool = computed(() => poolQuery.data.value);
  const enabled = computed(() => !!pool.value?.id);

  // DATA
  const queryKey = QUERY_KEYS.Pools.Snapshot(id);

  // METHODS
  const queryFn = async () => {
    if (!pool.value) throw new Error('No pool');

    const prices = await getTokensHistoricalPrice(
      appNetwork.id,
      pool.value.tokensList,
      days
    );
    const snapshots = await balancerSubgraph.poolSnapshots.get(id, days);

    return { prices, snapshots };
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
