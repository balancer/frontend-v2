import { computed, reactive } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { InfiniteData } from 'react-query/core';
import { UseInfiniteQueryOptions } from 'react-query/types';

import { useStore } from 'vuex';
import { flatten, isEmpty } from 'lodash';
import { getAddress } from '@ethersproject/address';

import QUERY_KEYS from '@/constants/queryKeys';

import BalancerSubgraph from '@/services/balancer/subgraph/service';
import { Pool } from '@/services/balancer/subgraph/types';

type PoolsQueryResponse = {
  pools: Pool[];
  tokens: string[];
  skip?: number;
};

export default function usePoolsQuery(
  options: UseInfiniteQueryOptions<PoolsQueryResponse> = {}
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
  const queryFn = async ({ pageParam = 0 }) => {
    const pools = await balancerSubgraph.pools.getDecorated(
      '24h',
      prices.value,
      { first: 10, skip: pageParam }
    );

    const tokens = flatten(pools.map(pool => pool.tokensList.map(getAddress)));

    return {
      pools,
      tokens,
      skip: pools.length ? pageParam + 10 : undefined
    };
  };

  const queryOptions = reactive({
    enabled: isQueryEnabled,
    onSuccess: async (poolsData: InfiniteData<PoolsQueryResponse>) => {
      await store.dispatch(
        'registry/injectTokens',
        poolsData.pages.map(page => page.tokens)
      );
    },
    keepPreviousData: true,
    getNextPageParam: (lastPage: PoolsQueryResponse) => lastPage.skip,
    ...options
  });

  return useInfiniteQuery<PoolsQueryResponse>(queryKey, queryFn, queryOptions);
}
