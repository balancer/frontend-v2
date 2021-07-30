import { computed, reactive, ref, Ref } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { UseInfiniteQueryOptions } from 'react-query/types';
import { flatten } from 'lodash';
import QUERY_KEYS from '@/constants/queryKeys';
import { POOLS } from '@/constants/pools';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { DecoratedPool } from '@/services/balancer/subgraph/types';
import useTokens2 from '../useTokens2';
import useUserSettings from '../useUserSettings';
import useApp from '../useApp';
import { getAddress } from '@ethersproject/address';
import { forChange } from '@/lib/utils';

type PoolsQueryResponse = {
  pools: DecoratedPool[];
  tokens: string[];
  skip?: number;
};

export default function usePoolsQuery(
  tokenList: Ref<string[]> = ref([]),
  options: UseInfiniteQueryOptions<PoolsQueryResponse> = {}
) {
  // COMPOSABLES
  const { injectTokens, dynamicDataLoading, prices } = useTokens2();
  const { currency } = useUserSettings();
  const { appLoading } = useApp();

  // DATA
  const queryKey = QUERY_KEYS.Pools.All(tokenList);

  // COMPUTED
  const enabled = computed(() => !appLoading.value);

  // METHODS
  const queryFn = async ({ pageParam = 0 }) => {
    const pools = await balancerSubgraphService.pools.get({
      first: POOLS.Pagination.PerPage,
      skip: pageParam,
      where: {
        tokensList_contains: tokenList.value
      }
    });
    const tokens = flatten(pools.map(pool => pool.tokensList));
    await injectTokens(tokens);
    await forChange(dynamicDataLoading, false);
    const decoratedPools = await balancerSubgraphService.pools.decorate(
      pools,
      '24h',
      prices.value,
      currency.value
    );

    return {
      pools: decoratedPools,
      tokens,
      skip:
        pools.length >= POOLS.Pagination.PerPage
          ? pageParam + POOLS.Pagination.PerPage
          : undefined
    };
  };

  const queryOptions = reactive({
    enabled,
    getNextPageParam: (lastPage: PoolsQueryResponse) => lastPage.skip,
    ...options
  });

  return useInfiniteQuery<PoolsQueryResponse>(queryKey, queryFn, queryOptions);
}
