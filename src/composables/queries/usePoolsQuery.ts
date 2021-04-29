import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';

import { useStore } from 'vuex';
import isEmpty from 'lodash/isEmpty';
import { getAddress } from '@ethersproject/address';

import useWeb3 from '@/composables/useWeb3';
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
  const shouldLoadPools = computed(() => !isEmpty(prices.value));

  // METHODS
  const queryFn = async () => {
    const pools = await await balancerSubgraph.getDecoratedPools(
      '24h',
      prices.value
    );

    const tokens = pools
      .map(pool => pool.tokensList.map(getAddress))
      .reduce((a, b) => [...a, ...b], []);

    return {
      pools,
      tokens
    };
  };

  const queryOptions = reactive({
    enabled: shouldLoadPools,
    onSuccess: async (poolsData: PoolsQueryResponse) => {
      await store.dispatch('registry/injectTokens', poolsData.tokens);
    },
    ...options
  });

  return useQuery<PoolsQueryResponse>(queryKey, queryFn, queryOptions);
}
