import { computed, reactive, Ref } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { InfiniteQueryObserverOptions } from 'react-query/core';

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
  currentCount: Ref<number>,
  options: InfiniteQueryObserverOptions<PoolsQueryResponse> = {
    getNextPageParam: lastPage => lastPage + 10,
  }
) {
  // SERVICES
  const balancerSubgraph = new BalancerSubgraph();

  // COMPOSABLES
  const store = useStore();

  // DATA
  const queryKey = reactive(QUERY_KEYS.Pools.All(currentCount));

  // COMPUTED
  const prices = computed(() => store.state.market.prices);
  const isQueryEnabled = computed(() => !isEmpty(prices.value));

  // METHODS
  const queryFn = async ({ pageParam = 0 }) => {
    const pools = await balancerSubgraph.pools.getDecorated(
      '24h',
      prices.value,
      { first: 10, skip: pageParam }
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

  return useInfiniteQuery<PoolsQueryResponse>(queryKey, queryFn, queryOptions);
}
