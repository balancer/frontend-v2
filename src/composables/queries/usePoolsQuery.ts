import { computed, reactive, ref, Ref } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { UseInfiniteQueryOptions } from 'react-query/types';
import { flatten } from 'lodash';
import QUERY_KEYS from '@/constants/queryKeys';
import { POOLS } from '@/constants/pools';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { DecoratedPool } from '@/services/balancer/subgraph/types';
import useTokens from '../useTokens';
import useUserSettings from '../useUserSettings';
import useApp from '../useApp';
import { forChange } from '@/lib/utils';
import useNetwork from '../useNetwork';

type PoolsQueryResponse = {
  pools: DecoratedPool[];
  tokens: string[];
  skip?: number;
  enabled?: boolean;
};

type FilterOptions = {
  poolIds?: Ref<string[]>;
  isExactTokensList?: boolean;
  pageSize?: number;
};

export default function usePoolsQuery(
  tokenList: Ref<string[]> = ref([]),
  options: UseInfiniteQueryOptions<PoolsQueryResponse> = {},
  filterOptions?: FilterOptions
) {
  // COMPOSABLES
  const { injectTokens, dynamicDataLoading, prices } = useTokens();
  const { currency } = useUserSettings();
  const { appLoading } = useApp();
  const { networkId } = useNetwork();

  // DATA
  const queryKey = QUERY_KEYS.Pools.All(
    networkId,
    tokenList,
    filterOptions?.poolIds
  );

  // COMPUTED
  const enabled = computed(() => !appLoading.value && options.enabled);

  // METHODS
  const queryFn = async ({ pageParam = 0 }) => {
    const tokensListFilterKey = filterOptions?.isExactTokensList
      ? 'tokensList'
      : 'tokensList_contains';
    const queryArgs: any = {
      first: filterOptions?.pageSize || POOLS.Pagination.PerPage,
      skip: pageParam,
      where: {
        [tokensListFilterKey]: tokenList.value
      }
    };
    if (filterOptions?.poolIds?.value.length) {
      queryArgs.where.id_in = filterOptions.poolIds.value;
    }

    const pools = await balancerSubgraphService.pools.get(queryArgs);

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
