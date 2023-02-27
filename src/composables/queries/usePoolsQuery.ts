import { Ref, ref, watch } from 'vue';
import { useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/vue-query';

import { POOLS } from '@/constants/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { Pool } from '@/services/pool/types';

import useNetwork from '../useNetwork';
import { useTokens } from '@/providers/tokens.provider';
import { configService } from '@/services/config/config.service';
import {
  GraphQLArgs,
  PoolsFallbackRepository,
  PoolsRepositoryFetchOptions,
  PoolRepository as SDKPoolRepository,
} from '@balancer-labs/sdk';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';
import { flatten } from 'lodash';
import { tokenTreeLeafs } from '../usePool';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { balancerAPIService } from '@/services/balancer/api/balancer-api.service';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { isBalancerApiDefined } from '@/lib/utils/balancer/api';

type PoolsQueryResponse = {
  pools: Pool[];
  skip?: number;
};

type FilterOptions = {
  poolIds?: Ref<string[]>;
  poolAddresses?: Ref<string[]>;
  isExactTokensList?: boolean;
  pageSize?: number;
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
  const { injectTokens, tokens: tokenMeta } = useTokens();
  const { networkId } = useNetwork();
  let poolsRepository = initializePoolsRepository();

  /**
   * METHODS
   */

  function initializePoolsRepository(): PoolsFallbackRepository {
    const fallbackRepository = new PoolsFallbackRepository(
      buildRepositories(),
      {
        timeout: 30 * 1000,
      }
    );
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
      get skip(): number {
        return balancerSubgraphService.pools.skip;
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
    const tokensListFilterOperation = filterOptions?.isExactTokensList
      ? 'eq'
      : 'contains';

    const tokenListFormatted = filterTokens.value.map(address =>
      address.toLowerCase()
    );
    const queryArgs: GraphQLArgs = {
      chainId: configService.network.chainId,
      orderBy: poolsSortField?.value || 'totalLiquidity',
      orderDirection: 'desc',
      where: {
        tokensList: { [tokensListFilterOperation]: tokenListFormatted },
        poolType: { not_in: POOLS.ExcludedPoolTypes },
        totalShares: { gt: 0.01 },
        id: { not_in: POOLS.BlockList },
      },
    };
    if (queryArgs.where && filterOptions?.poolIds?.value) {
      queryArgs.where.id = { in: filterOptions.poolIds.value };
    }
    if (queryArgs.where && filterOptions?.poolAddresses?.value) {
      queryArgs.where.address = { in: filterOptions.poolAddresses.value };
    }
    if (options.first) {
      queryArgs.first = options.first;
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
    let skip = 0;
    try {
      const pools: Pool[] = await poolsRepository.fetch(fetchOptions);

      skip = poolsRepository.currentProvider?.skip
        ? poolsRepository.currentProvider.skip
        : 0;

      poolsStoreService.setPools(pools);

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

  options.getNextPageParam = (lastPage: PoolsQueryResponse) => lastPage.skip;

  return useInfiniteQuery<PoolsQueryResponse>(queryKey, queryFn, options);
}
