import { flatten } from 'lodash';
import { UseInfiniteQueryOptions } from 'react-query/types';
import { computed, reactive, Ref, ref } from 'vue';
import { useInfiniteQuery } from 'vue-query';

import { POOLS } from '@/constants/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';
import { Pool } from '@/services/pool/types';

import useApp from '../useApp';
import useNetwork from '../useNetwork';
import { lpTokensFor } from '../usePool';
import useTokens from '../useTokens';
import useUserSettings from '../useUserSettings';
import useGaugesQuery from './useGaugesQuery';
import { forChange } from '@/lib/utils';

type PoolsQueryResponse = {
  pools: Pool[];
  tokens: string[];
  skip?: number;
  enabled?: boolean;
};

type FilterOptions = {
  poolIds?: Ref<string[]>;
  poolAddresses?: Ref<string[]>;
  isExactTokensList?: boolean;
  pageSize?: number;
};

export default function usePoolsQuery(
  tokenList: Ref<string[]> = ref([]),
  options: UseInfiniteQueryOptions<PoolsQueryResponse> = {},
  filterOptions?: FilterOptions
) {
  /**
   * COMPOSABLES
   */
  const {
    injectTokens,
    prices,
    tokens: tokenMeta,
    dynamicDataLoading,
  } = useTokens();
  const { currency } = useUserSettings();
  const { appLoading } = useApp();
  const { networkId } = useNetwork();
  const { data: subgraphGauges } = useGaugesQuery();
  const gaugeAddresses = computed(() =>
    (subgraphGauges.value || []).map(gauge => gauge.id)
  );

  /**
   * COMPUTED
   */
  const enabled = computed(() => !appLoading.value && options.enabled);

  /**
   * METHODS
   */
  function getQueryArgs(pageParam = 0) {
    const tokensListFilterKey = filterOptions?.isExactTokensList
      ? 'tokensList'
      : 'tokensList_contains';

    const queryArgs: any = {
      first: filterOptions?.pageSize || POOLS.Pagination.PerPage,
      skip: pageParam,
      where: {
        [tokensListFilterKey]: tokenList.value,
        poolType_not_in: POOLS.ExcludedPoolTypes,
      },
    };
    if (filterOptions?.poolIds?.value.length) {
      queryArgs.where.id_in = filterOptions.poolIds.value;
    }
    if (filterOptions?.poolAddresses?.value.length) {
      queryArgs.where.address_in = filterOptions.poolAddresses.value;
    }
    return queryArgs;
  }

  /**
   * QUERY KEY
   */
  const queryKey = QUERY_KEYS.Pools.All(
    networkId,
    tokenList,
    filterOptions?.poolIds,
    filterOptions?.poolAddresses,
    gaugeAddresses
  );

  /**
   * QUERY FUNCTION
   */
  const queryFn = async ({ pageParam = 0 }) => {
    const queryArgs = getQueryArgs(pageParam);
    const pools = await balancerSubgraphService.pools.get(queryArgs);

    const poolDecorator = new PoolDecorator(pools);
    let decoratedPools = await poolDecorator.decorate(
      subgraphGauges.value || [],
      prices.value,
      currency.value,
      tokenMeta.value
    );

    const tokens = flatten(
      pools.map(pool => [
        ...pool.tokensList,
        ...lpTokensFor(pool),
        pool.address,
      ])
    );
    await injectTokens(tokens);
    await forChange(dynamicDataLoading, false);

    decoratedPools = poolDecorator.reCalculateTotalLiquidities(
      prices.value,
      currency.value,
      tokenMeta.value
    );

    return {
      pools: decoratedPools,
      tokens,
      skip:
        pools.length >= POOLS.Pagination.PerPage
          ? pageParam + POOLS.Pagination.PerPage
          : undefined,
    };
  };

  const queryOptions = reactive({
    ...options,
    getNextPageParam: (lastPage: PoolsQueryResponse) => lastPage.skip,
    enabled,
  });

  return useInfiniteQuery<PoolsQueryResponse>(queryKey, queryFn, queryOptions);
}
