import { useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/vue-query';

import { POOLS } from '@/constants/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { Pool } from '@/services/pool/types';

import useNetwork from '../useNetwork';
import { useTokens } from '@/providers/tokens.provider';
import { configService } from '@/services/config/config.service';
import {
  GraphQLArgs,
  PoolsRepositoryFetchOptions,
  PoolRepository as SDKPoolRepository,
} from '@balancer-labs/sdk';
import { getPoolsFallbackRepository } from '@/dependencies/PoolsFallbackRepository';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';
import { flatten } from 'lodash';
import { tokenTreeLeafs } from '../usePoolHelpers';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { balancerAPIService } from '@/services/balancer/api/balancer-api.service';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { isBalancerApiDefined } from '@/lib/utils/balancer/api';
import { bnum } from '@/lib/utils';
import { PoolFilterOptions } from '@/types/pools';
import { PoolType } from '@/services/pool/types';

type PoolsQueryResponse = {
  pools: Pool[];
  skip?: number;
};

export default function usePoolsQuery(filterOptions: PoolFilterOptions) {
  /**
   * COMPOSABLES
   */
  const { injectTokens, tokens: tokenMeta } = useTokens();
  const { networkId } = useNetwork();
  let poolsRepository = initializePoolsRepository();

  /**
   * METHODS
   */

  function initializePoolsRepository() {
    const FallbackRepository = getPoolsFallbackRepository();
    const fallbackRepository = new FallbackRepository(buildRepositories(), {
      timeout: 30 * 1000,
    });
    return fallbackRepository;
  }

  function initializeDecoratedAPIRepository() {
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

  function initializeDecoratedSubgraphRepository() {
    return {
      fetch: async (options: PoolsRepositoryFetchOptions): Promise<Pool[]> => {
        const pools = await balancerSubgraphService.pools.get(
          getQueryArgs(options)
        );

        const poolDecorator = new PoolDecorator(pools);
        let decoratedPools = await poolDecorator.decorate(tokenMeta.value);

        const tokens = flatten(
          pools.map(pool => [
            ...pool.tokensList,
            ...tokenTreeLeafs(pool.tokens),
            pool.address,
          ])
        );
        await injectTokens(tokens);

        decoratedPools = await poolDecorator.reCalculateTotalLiquidities();

        return decoratedPools;
      },
      get skip(): undefined {
        return undefined;
      },
    };
  }

  function buildRepositories() {
    const repositories: SDKPoolRepository[] = [];
    if (isBalancerApiDefined) {
      const balancerApiRepository = initializeDecoratedAPIRepository();
      repositories.push(balancerApiRepository);
    }
    const subgraphRepository = initializeDecoratedSubgraphRepository();
    repositories.push(subgraphRepository);

    return repositories;
  }

  function getQueryArgs(options: PoolsRepositoryFetchOptions): GraphQLArgs {
    const { tokens, poolIds, poolTypes, sortField } = filterOptions.value;
    const hasPoolIdFilters = !!poolIds?.length && poolIds?.length > 0;
    const hasPoolTypeFilters = !!poolTypes?.length;

    const tokensListFilterOperation = filterOptions.value.useExactTokens
      ? 'eq'
      : 'contains';

    const tokenListFormatted =
      tokens?.map(address => address.toLowerCase()) || [];

    const orderBy = isBalancerApiDefined
      ? sortField || 'totalLiquidity'
      : 'totalLiquidity';

    const queryArgs: GraphQLArgs = {
      chainId: configService.network.chainId,
      orderBy,
      orderDirection: 'desc',
      where: {
        tokensList: { [tokensListFilterOperation]: tokenListFormatted },
        poolType: { in: POOLS.IncludedPoolTypes },
        totalShares: { gt: 0.00001 },
        id: { not_in: POOLS.BlockList },
      },
    };

    if (queryArgs.where && hasPoolTypeFilters && !!poolTypes?.length) {
      queryArgs.where.poolType = {
        in: poolTypes,
      };
    }

    if (queryArgs.where && hasPoolIdFilters) {
      queryArgs.where.id = { in: filterOptions.value.poolIds };
    }
    if (options.first) {
      queryArgs.first = filterOptions.value.first || options.first;
    }
    if (options.skip) {
      queryArgs.skip = options.skip;
    }

    console.log('queryArgs', queryArgs);

    return queryArgs;
  }

  function getFetchOptions(pageParam = 0): PoolsRepositoryFetchOptions {
    const fetchArgs: PoolsRepositoryFetchOptions = {};
    const { tokens, poolIds, poolTypes } = filterOptions.value;
    const hasTokenFilters = !!tokens?.length;
    const hasPoolIdFilters = !!poolIds?.length;
    const hasPoolTypeFilters = !!poolTypes?.length;

    // Don't use a limit if there is a token list because the limit is applied
    // pre-filter
    if (hasPoolTypeFilters && poolTypes.includes(PoolType.Weighted)) {
      fetchArgs.first = 100;
    } else if (!hasTokenFilters && !hasPoolIdFilters && !hasPoolTypeFilters) {
      fetchArgs.first =
        filterOptions.value.pageSize || POOLS.Pagination.PerPage;
    }

    if (pageParam && pageParam > 0) {
      fetchArgs.skip = pageParam;
    }

    return fetchArgs;
  }

  function customSort(pools: Pool[]): Pool[] {
    const poolsSortField = filterOptions.value.sortField || 'totalLiquidity';

    if (poolsSortField === 'totalLiquidity') return pools;

    if (poolsSortField === 'apr') {
      return pools.sort((a, b) => {
        const aprA = a?.apr?.max ?? 0;
        const aprB = b?.apr?.max ?? 0;
        return aprB - aprA;
      });
    } else if (poolsSortField === 'volume') {
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
    filterOptions,
    () => {
      poolsRepository = initializePoolsRepository();
    },
    { deep: true }
  );

  /**
   * QUERY KEY
   */
  const queryKey = QUERY_KEYS.Pools.All(networkId, filterOptions);

  /**
   * QUERY FUNCTION
   */
  const queryFn = async ({ pageParam = 0 }) => {
    const fetchOptions = getFetchOptions(pageParam);
    let skip = 0;
    try {
      let pools: Pool[] = await poolsRepository.fetch(fetchOptions);
      if (!isBalancerApiDefined) pools = customSort(pools);

      poolsStoreService.addPools(pools);

      skip = poolsRepository.currentProvider?.skip
        ? poolsRepository.currentProvider.skip
        : poolsStoreService.pools.value?.length || 0;

      console.log('skip', skip);

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

  const options: UseInfiniteQueryOptions<PoolsQueryResponse> = {
    getNextPageParam: (lastPage: PoolsQueryResponse) => lastPage.skip || 0,
  };

  return useInfiniteQuery<PoolsQueryResponse>(queryKey, queryFn, options);
}
