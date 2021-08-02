import { computed, reactive, ref, Ref } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { UseInfiniteQueryOptions } from 'react-query/types';
import { useStore } from 'vuex';
import { flatten } from 'lodash';

import QUERY_KEYS from '@/constants/queryKeys';
import { POOLS } from '@/constants/pools';

import BalancerSubgraph from '@/services/balancer/subgraph/service';
import { DecoratedPool } from '@/services/balancer/subgraph/types';
import useTokens from '../useTokens';

type PoolsQueryResponse = {
  pools: DecoratedPool[];
  tokens: string[];
  skip?: number;
};

type FilterOptions = {
  poolIds?: Ref<string[]>;
  pageSize?: number;
};

export default function usePoolsQuery(
  tokenList: Ref<string[]> = ref([]),
  options: UseInfiniteQueryOptions<PoolsQueryResponse> = {},
  filterOptions?: FilterOptions
) {
  // SERVICES
  const balancerSubgraph = new BalancerSubgraph();

  // COMPOSABLES
  const store = useStore();
  const { tokens: allTokens } = useTokens();

  // DATA
  const queryKey = QUERY_KEYS.Pools.All(tokenList, filterOptions?.poolIds);

  // COMPUTED
  const appLoading = computed(() => store.state.app.loading);
  const prices = computed(() => store.state.market.prices);
  const isQueryEnabled = computed(() => !appLoading.value);

  function uninjected(tokens: string[]): string[] {
    const allAddresses = Object.keys(allTokens.value);
    return tokens.filter(address => !allAddresses.includes(address));
  }

  // METHODS
  const queryFn = async ({ pageParam = 0 }) => {
    const queryArgs: any = {
      first: filterOptions?.pageSize || POOLS.Pagination.PerPage,
      skip: pageParam,
      where: {
        tokensList_contains: tokenList.value
      }
    };

    if (filterOptions?.poolIds?.value.length)
      queryArgs.where.id_in = filterOptions.poolIds.value;
    const pools = await balancerSubgraph.pools.getDecorated(
      '24h',
      prices.value,
      queryArgs
    );

    const tokens = flatten(pools.map(pool => pool.tokenAddresses));
    const uninjectedTokens = uninjected(tokens);
    if (uninjectedTokens.length > 0) {
      await store.dispatch('registry/injectTokens', uninjectedTokens);
    }

    return {
      pools,
      tokens,
      skip:
        pools.length >= POOLS.Pagination.PerPage
          ? pageParam + POOLS.Pagination.PerPage
          : undefined
    };
  };

  const queryOptions = reactive({
    enabled: isQueryEnabled,
    getNextPageParam: (lastPage: PoolsQueryResponse) => lastPage.skip,
    ...options
  });

  return useInfiniteQuery<PoolsQueryResponse>(queryKey, queryFn, queryOptions);
}
