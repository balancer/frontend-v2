import { computed, reactive, ref, Ref } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { InfiniteData } from 'react-query/core';
import { UseInfiniteQueryOptions } from 'react-query/types';
import { useStore } from 'vuex';
import { flatten, isEmpty } from 'lodash';
import { getAddress } from '@ethersproject/address';

import QUERY_KEYS from '@/constants/queryKeys';
import { POOLS } from '@/constants/pools';

import BalancerSubgraph from '@/services/balancer/subgraph/service';
import { DecoratedPool } from '@/services/balancer/subgraph/types';

type PoolsQueryResponse = {
  pools: DecoratedPool[];
  tokens: string[];
  skip?: number;
};

export default function usePoolsQuery(
  tokenList: Ref<string[]> = ref([]),
  options: UseInfiniteQueryOptions<PoolsQueryResponse> = {}
) {
  // SERVICES
  const balancerSubgraph = new BalancerSubgraph();

  // COMPOSABLES
  const store = useStore();

  // DATA
  const queryKey = QUERY_KEYS.Pools.All(tokenList);

  // COMPUTED
  const prices = computed(() => store.state.market.prices);
  const isQueryEnabled = computed(() => !isEmpty(prices.value));

  // METHODS
  const queryFn = async ({ pageParam = 0 }) => {
    const pools = await balancerSubgraph.pools.getDecorated(
      '24h',
      prices.value,
      {
        first: POOLS.Pagination.PerPage,
        skip: pageParam,
        where: {
          tokensList_contains: tokenList.value
        }
      }
    );

    const tokens = flatten(pools.map(pool => pool.tokensList.map(getAddress)));

    return {
      pools,
      tokens,
      skip: pools.length ? pageParam + POOLS.Pagination.PerPage : undefined
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
    getNextPageParam: (lastPage: PoolsQueryResponse) => lastPage.skip,
    ...options
  });

  return useInfiniteQuery<PoolsQueryResponse>(queryKey, queryFn, queryOptions);
}
