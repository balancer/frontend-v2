import { UseInfiniteQueryOptions } from 'react-query/types';
import { computed, reactive, Ref, ref, watch } from 'vue';
import { useInfiniteQuery } from 'vue-query';

import { POOLS } from '@/constants/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { Pool } from '@/services/pool/types';

import useApp from '../useApp';
import useNetwork from '../useNetwork';
import useTokens from '../useTokens';
import { configService } from '@/services/config/config.service';
import {
  GraphQLArgs,
  PoolsBalancerAPIRepository,
  PoolsFallbackRepository,
  PoolsRepositoryFetchOptions,
  PoolsSubgraphRepository,
} from '@balancer-labs/sdk';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';
import { flatten } from 'lodash';
import { extractTokenAddresses } from '../usePool';
import { forChange } from '@/lib/utils';

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

const tokenAttrs = {
  address: true,
  balance: true,
  weight: true,
  priceRate: true,
  symbol: true,
  decimals: true,
};

const poolAttrs = {
  id: true,
  totalShares: true,
  address: true,
  poolType: true,
  mainIndex: true,
};

// Nested token tree attributes, 3 levels deep.
const tokenTreeAttrs = {
  ...tokenAttrs,
  token: {
    latestUSDPrice: true,
    pool: {
      ...poolAttrs,
      tokens: {
        ...tokenAttrs,
        token: {
          latestUSDPrice: true,
          pool: {
            ...poolAttrs,
            tokens: {
              ...tokenAttrs,
              token: {
                latestUSDPrice: true,
                pool: {
                  ...poolAttrs,
                },
              },
            },
          },
        },
      },
    },
  },
};

const queryAttrs = {
  pools: {
    id: true,
    address: true,
    poolType: true,
    swapFee: true,
    tokensList: true,
    totalLiquidity: true,
    totalSwapVolume: true,
    totalSwapFee: true,
    totalShares: true,
    volumeSnapshot: true,
    owner: true,
    factory: true,
    amp: true,
    createTime: true,
    swapEnabled: true,
    symbol: true,
    name: true,
    tokens: tokenTreeAttrs,
    isNew: true,
    apr: {
      stakingApr: {
        min: true,
        max: true,
      },
      swapFees: true,
      tokenAprs: {
        total: true,
        breakdown: true,
      },
      rewardAprs: {
        total: true,
        breakdown: true,
      },
      protocolApr: true,
      min: true,
      max: true,
    },
  },
};

export default function usePoolsQuery(
  filterTokens: Ref<string[]> = ref([]),
  options: UseInfiniteQueryOptions<PoolsQueryResponse> = {},
  filterOptions?: FilterOptions
) {
  /**
   * COMPOSABLES
   */
  const { injectTokens, tokens: tokenMeta, dynamicDataLoading } = useTokens();
  const { appLoading } = useApp();
  const { networkId } = useNetwork();

  let balancerApiRepository = initializeDecoratedAPIRepository();
  let subgraphRepository = initializeDecoratedSubgraphRepository();
  let poolsRepository = initializePoolsRepository();

  /**
   * COMPUTED
   */
  const enabled = computed(() => !appLoading.value);

  /**
   * METHODS
   */

  function initializePoolsRepository(): PoolsFallbackRepository {
    const fallbackRepository = new PoolsFallbackRepository(
      [balancerApiRepository, subgraphRepository],
      {
        timeout: 30 * 1000,
      }
    );
    return fallbackRepository;
  }

  function initializeDecoratedAPIRepository() {
    const balancerApiRepository = new PoolsBalancerAPIRepository({
      url: configService.network.balancerApi || '',
      apiKey: configService.network.keys.balancerApi || '',
      query: {
        args: getQueryArgs(),
        attrs: queryAttrs,
      },
    });

    return {
      fetch: async (options: PoolsRepositoryFetchOptions): Promise<Pool[]> => {
        return balancerApiRepository.fetch(options);
      },
      get skip(): number {
        return balancerApiRepository.skip;
      },
    };
  }

  function initializeDecoratedSubgraphRepository() {
    const subgraphRepository = new PoolsSubgraphRepository({
      url: configService.network.subgraph,
      chainId: configService.network.chainId,
      query: {
        args: getQueryArgs(),
        attrs: queryAttrs,
      },
    });

    return {
      fetch: async (options: PoolsRepositoryFetchOptions): Promise<Pool[]> => {
        const pools = await subgraphRepository.fetch(options);

        const poolDecorator = new PoolDecorator(pools);
        let decoratedPools = await poolDecorator.decorate(tokenMeta.value);

        const tokenAddresses = flatten(pools.map(extractTokenAddresses));
        await injectTokens(tokenAddresses);
        await forChange(dynamicDataLoading, false);

        decoratedPools = await poolDecorator.reCalculateTotalLiquidities();

        return decoratedPools;
      },
      get skip(): number {
        return subgraphRepository.skip;
      },
    };
  }

  function getQueryArgs(): GraphQLArgs {
    const tokensListFilterOperation = filterOptions?.isExactTokensList
      ? 'eq'
      : 'contains';

    const tokenListFormatted = filterTokens.value.map(address =>
      address.toLowerCase()
    );

    const queryArgs: any = {
      chainId: configService.network.chainId,
      orderBy: 'totalLiquidity',
      orderDirection: 'desc',
      where: {
        tokensList: { [tokensListFilterOperation]: tokenListFormatted },
        poolType: { not_in: POOLS.ExcludedPoolTypes },
        totalShares: { gt: 0.01 },
        id: { not_in: POOLS.BlockList },
      },
    };
    if (filterOptions?.poolIds?.value.length) {
      queryArgs.where.id = { in: filterOptions.poolIds.value };
    }
    if (filterOptions?.poolAddresses?.value.length) {
      queryArgs.where.address = { in: filterOptions.poolAddresses.value };
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
    filterTokens,
    () => {
      balancerApiRepository = initializeDecoratedAPIRepository();
      subgraphRepository = initializeDecoratedSubgraphRepository();
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
    filterOptions?.poolIds,
    filterOptions?.poolAddresses
  );

  /**
   * QUERY FUNCTION
   */
  const queryFn = async ({ pageParam = 0 }) => {
    const fetchOptions = getFetchOptions(pageParam);

    const pools: Pool[] = await poolsRepository.fetch(fetchOptions);

    const skip = poolsRepository.currentProvider?.skip
      ? poolsRepository.currentProvider.skip
      : 0;

    return {
      pools,
      skip,
    };
  };

  const queryOptions = reactive({
    ...options,
    getNextPageParam: (lastPage: PoolsQueryResponse) => lastPage.skip,
    enabled,
  });

  return useInfiniteQuery<PoolsQueryResponse>(queryKey, queryFn, queryOptions);
}
