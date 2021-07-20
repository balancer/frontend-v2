import { computed, reactive, ref, Ref } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { UseInfiniteQueryOptions } from 'react-query/types';
import { useStore } from 'vuex';
import { flatten } from 'lodash';

import QUERY_KEYS from '@/constants/queryKeys';
import { POOLS } from '@/constants/pools';

import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { DecoratedPool } from '@/services/balancer/subgraph/types';
import useTokens2 from '../useTokens2';

type PoolsQueryResponse = {
  pools: DecoratedPool[];
  poolTokenAddresses: string[];
  skip?: number;
};

export default function usePoolsQuery(
  tokenList: Ref<string[]> = ref([]),
  options: UseInfiniteQueryOptions<PoolsQueryResponse> = {}
) {
  // COMPOSABLES
  const store = useStore();
  const { injectTokens } = useTokens2();

  // DATA
  const queryKey = QUERY_KEYS.Pools.All(tokenList);

  // COMPUTED
  const appLoading = computed(() => store.state.app.loading);
  const prices = computed(() => store.state.market.prices);
  const isQueryEnabled = computed(() => !appLoading.value);

  // METHODS
  const queryFn = async ({ pageParam = 0 }) => {
    const pools = await balancerSubgraphService.pools.getDecorated(
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

    const poolTokenAddresses = flatten(pools.map(pool => pool.tokenAddresses));
    injectTokens(poolTokenAddresses);

    return {
      pools,
      poolTokenAddresses,
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
