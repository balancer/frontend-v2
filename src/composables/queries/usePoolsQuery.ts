import { useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/vue-query';

import { POOLS } from '@/constants/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { Pool } from '@/services/pool/types';

import useNetwork from '../useNetwork';
import { useTokens } from '@/providers/tokens.provider';
import { configService } from '@/services/config/config.service';
import { PoolsRepositoryFetchOptions } from '@balancer-labs/sdk';
import { flatten } from 'lodash';
import { tokenTreeLeafs } from '../usePoolHelpers';
import { balancerAPIService } from '@/services/balancer/api/balancer-api.service';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { isBalancerApiDefined } from '@/lib/utils/balancer/api';
import { bnum } from '@/lib/utils';
import {
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
} from '@/services/api/graphql/generated/api-types';
import { ApiArgs } from '@/services/balancer/api/entities/pools';
import { mapNetworkToApiChain, mapPoolTypeToApiType } from '@/lib/utils/api';

type PoolsQueryResponse = {
  pools: Pool[];
  skip?: number;
};

type FilterOptions = {
  poolIds?: Ref<string[]>;
  poolAddresses?: Ref<string[]>;
  isExactTokensList?: boolean;
  pageSize?: number;
  first?: number;
  poolTypes?: string[];
};

export default function usePoolsQuery(
  filterTokens: Ref<string[]> = ref([]),
  options: UseInfiniteQueryOptions<PoolsQueryResponse> = {},
  filterOptions?: FilterOptions,
  poolsSortField?: Ref<string>
) {
  /**
   * COMPOSABLES
   */
  const { injectTokens } = useTokens();
  const { networkId } = useNetwork();
  let poolsRepository = initializePoolsRepository();

  /**
   * METHODS
   */

  function initializePoolsRepository() {
    return {
      fetch: async (options: PoolsRepositoryFetchOptions): Promise<Pool[]> => {
        const pools = await balancerAPIService.pools.get(getQueryArgs(options));

        const tokens = flatten(
          pools.map(pool => [
            ...pool.tokensList,
            ...tokenTreeLeafs(pool.tokens),
            pool.address,
          ])
        );
        injectTokens(tokens);

        return pools;
      },
      get skip(): number {
        return balancerAPIService.pools.skip;
      },
    };
  }

  function convertSortFieldToOrderBy(
    sortField: string | undefined
  ): GqlPoolOrderBy {
    switch (sortField) {
      case 'apr':
        return GqlPoolOrderBy.Apr;
      case 'volume':
        return GqlPoolOrderBy.Volume24h;
      case 'totalLiquidity':
      default:
        return GqlPoolOrderBy.TotalLiquidity;
    }
  }

  function getQueryArgs(options: PoolsRepositoryFetchOptions): ApiArgs {
    const hasPoolTypeFilters = !!filterOptions?.poolTypes?.length;

    const tokenListFormatted = filterTokens.value.map(address =>
      address.toLowerCase()
    );

    const orderBy = convertSortFieldToOrderBy(poolsSortField?.value);

    const queryArgs: ApiArgs = {
      orderBy,
      orderDirection: GqlPoolOrderDirection.Desc,
      where: {
        chainIn: [mapNetworkToApiChain(configService.network.chainId)],
        tokensIn: tokenListFormatted,
        poolTypeIn: POOLS.IncludedPoolTypes.map(mapPoolTypeToApiType),
        idNotIn: POOLS.BlockList,
      },
    };

    if (
      queryArgs.where &&
      hasPoolTypeFilters &&
      !!filterOptions?.poolTypes?.length
    ) {
      queryArgs.where.poolTypeIn =
        filterOptions?.poolTypes.map(mapPoolTypeToApiType);
    }

    if (queryArgs.where && filterOptions?.poolIds?.value) {
      queryArgs.where.idIn = filterOptions?.poolIds?.value;
    }
    if (options.first) {
      queryArgs.first = filterOptions?.first || options.first;
    }
    if (options.skip) {
      queryArgs.skip = options.skip;
    }
    return queryArgs;
  }

  function getFetchOptions(pageParam = 0): PoolsRepositoryFetchOptions {
    const fetchArgs: PoolsRepositoryFetchOptions = {};

    // Don't use a limit if there is a token list because the limit is applied pre-filter
    if (!filterTokens.value.length) {
      fetchArgs.first = filterOptions?.pageSize || POOLS.Pagination.PerPage;
    }

    if (pageParam && pageParam > 0) {
      fetchArgs.skip = pageParam;
    }

    return fetchArgs;
  }

  function customSort(pools: Pool[]): Pool[] {
    if (poolsSortField?.value === 'totalLiquidity') return pools;

    if (poolsSortField?.value === 'apr') {
      return pools.sort((a, b) => {
        const aprA = a?.apr?.max ?? 0;
        const aprB = b?.apr?.max ?? 0;
        return aprB - aprA;
      });
    } else if (poolsSortField?.value === 'volume') {
      return pools.sort((a, b) => {
        const volumeA = bnum(a?.totalSwapVolume ?? 0);
        const volumeB = bnum(b?.totalSwapVolume ?? 0);
        return volumeB.minus(volumeA).toNumber();
      });
    }

    return pools;
  }

  /**
   *  When filterTokens changes, re-initialize the repositories as their queries
   *  need to change to filter for those tokens
   */
  watch(
    () => [filterTokens, poolsSortField],
    () => {
      poolsRepository = initializePoolsRepository();
    },
    { deep: true }
  );

  /**
   * QUERY KEY
   */
  const queryKey = QUERY_KEYS.Pools.All(
    networkId,
    filterTokens,
    poolsSortField,
    filterOptions?.poolIds,
    filterOptions?.poolAddresses
  );

  /**
   * QUERY FUNCTION
   */
  const queryFn = async ({ pageParam = 0 }) => {
    const fetchOptions = getFetchOptions(pageParam);
    const skip = (fetchOptions.first || 0) + (fetchOptions.skip || 0);
    try {
      let pools: Pool[] = await poolsRepository.fetch(fetchOptions);
      if (!isBalancerApiDefined) pools = customSort(pools);

      poolsStoreService.addPools(pools);

      return {
        pools,
        skip,
      };
    } catch (e) {
      const savedPools = poolsStoreService.pools.value;
      if (savedPools && savedPools.length > 0) {
        return { pools: savedPools, skip };
      }
      throw e;
    }
  };

  options.getNextPageParam = (lastPage: PoolsQueryResponse) =>
    lastPage.skip || 0;

  return useInfiniteQuery<PoolsQueryResponse>(queryKey, queryFn, options);
}
