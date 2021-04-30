import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';

import { useStore } from 'vuex';
import { flatten, isEmpty } from 'lodash';
import { getAddress } from '@ethersproject/address';

import QUERY_KEYS from '@/constants/queryKeys';

import BalancerSubgraph from '@/services/balancer/subgraph/service';
import { Pool } from '@/services/balancer/subgraph/types';

type PoolsQueryResponse = {
  pools: Pool[];
  tokens: string[];
};

export default function usePoolsQuery(
  options: QueryObserverOptions<PoolsQueryResponse> = {}
) {
  // SERVICES
  const balancerSubgraph = new BalancerSubgraph();

  // COMPOSABLES
  const store = useStore();

  // DATA
  const queryKey = QUERY_KEYS.Pools.All;

  // COMPUTED
  const prices = computed(() => store.state.market.prices);
  const isQueryEnabled = computed(() => !isEmpty(prices.value));

  // METHODS
  const queryFn = async () => {
    const pools = await balancerSubgraph.pools.getDecorated(
      '24h',
      prices.value
    );

    const tokens = flatten(pools.map(pool => pool.tokensList.map(getAddress)));

    return {
      pools,
      tokens
    };
  };

  const queryOptions = reactive({
    enabled: isQueryEnabled,
    onSuccess: async (poolsData: PoolsQueryResponse) => {
      await store.dispatch('registry/injectTokens', poolsData.tokens);
    },
    ...options
  });

  return useQuery<PoolsQueryResponse>(queryKey, queryFn, queryOptions);
}
