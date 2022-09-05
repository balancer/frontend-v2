import { UseInfiniteQueryOptions } from 'react-query/types';
import { computed, reactive, Ref, ref, watch } from 'vue';
import { useInfiniteQuery } from 'vue-query';

import { POOLS } from '@/constants/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { Pool } from '@/services/pool/types';

import useApp from '../useApp';
import useNetwork from '../useNetwork';
import useTokens from '../useTokens';
import useUserSettings from '../useUserSettings';
import useGaugesQuery from './useGaugesQuery';
import { configService } from '@/services/config/config.service';
import {
  GraphQLArgs,
  Op,
  PoolsBalancerAPIRepository,
  PoolsFallbackRepository,
  PoolsRepositoryFetchOptions,
  PoolsSubgraphRepository,
} from '@balancer-labs/sdk';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';

type PoolsQueryResponse = {
  pools: Pool[];
  skip?: number;
  enabled?: boolean;
};

type FilterOptions = {
  poolIds?: Ref<string[]>;
  poolAddresses?: Ref<string[]>;
  isExactTokensList?: boolean;
  pageSize?: number;
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
    tokens: {
      address: true,
      balance: true,
      weight: true,
      priceRate: true,
      symbol: true,
    },
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
  skip: true,
};

export default function usePoolsQuery(
  tokenList: Ref<string[]> = ref([]),
  options: UseInfiniteQueryOptions<PoolsQueryResponse> = {},
  filterOptions?: FilterOptions
) {
  /**
   * COMPOSABLES
   */
  const { prices, tokens: tokenMeta } = useTokens();
  const { currency } = useUserSettings();
  const { appLoading } = useApp();
  const { networkId } = useNetwork();
  const { data: subgraphGauges } = useGaugesQuery();
  const gaugeAddresses = computed(() =>
    (subgraphGauges.value || []).map(gauge => gauge.id)
  );

  let balancerApiRepository = initializeDecoratedAPIRepository();
  let subgraphRepository = initializeDecoratedSubgraphRepository();

  /**
   * COMPUTED
   */
  const enabled = computed(() => !appLoading.value && options.enabled);

  /**
   * METHODS
   */

  function initializePoolsRepository(): PoolsFallbackRepository {
    console.log('Initializing the fallback. Token list is: ', tokenList);
    const fallbackRepository = new PoolsFallbackRepository(
      [balancerApiRepository, subgraphRepository],
      30 * 1000
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
    const subgraphRepository = new PoolsSubgraphRepository(
      configService.network.subgraph
    );

    return {
      fetch: async (options: PoolsRepositoryFetchOptions): Promise<Pool[]> => {
        const pools = await subgraphRepository.fetch(options);

        const poolDecorator = new PoolDecorator(pools);
        const decoratedPools = await poolDecorator.decorate(
          subgraphGauges.value || [],
          prices.value,
          currency.value,
          tokenMeta.value
        );

        return decoratedPools;
      },
      get skip(): number {
        return subgraphRepository.skip;
      },
    };
  }

  function getQueryArgs(): GraphQLArgs {
    const tokensListFilterOperation = filterOptions?.isExactTokensList
      ? Op.Equals
      : Op.Contains;

    const tokenListFormatted = tokenList.value.map(address =>
      address.toLowerCase()
    );

    const queryArgs: any = {
      chainId: configService.network.chainId,
      orderBy: 'totalLiquidity',
      orderDirection: 'desc',
      where: {
        tokensList: tokensListFilterOperation(tokenListFormatted),
        poolType: Op.NotIn(POOLS.ExcludedPoolTypes),
        totalShares: Op.GreaterThan(0.01),
        id: Op.NotIn(POOLS.BlockList),
      },
    };
    if (filterOptions?.poolIds?.value.length) {
      queryArgs.where.id = Op.In(filterOptions.poolIds.value);
    }
    if (filterOptions?.poolAddresses?.value.length) {
      queryArgs.where.address = Op.In(filterOptions.poolAddresses.value);
    }
    return queryArgs;
  }

  function getFetchOptions(pageParam = 0): PoolsRepositoryFetchOptions {
    const fetchArgs: PoolsRepositoryFetchOptions = {};

    if (pageParam && pageParam > 0) {
      fetchArgs.skip = pageParam;
    }

    return fetchArgs;
  }

  /**
   *  When tokenList changes, re-initialize the repositories as their queries
   *  need to change to filter for those tokens
   */
  watch(
    tokenList,
    () => {
      console.log(
        'Token list changed to: ',
        tokenList,
        ' re-building repositories'
      );
      balancerApiRepository = initializeDecoratedAPIRepository();
      subgraphRepository = initializeDecoratedSubgraphRepository();
    },
    { deep: true }
  );

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
    console.time('usePoolsQuery-overall');
    console.time('usePoolsQuery-init');
    const fetchOptions = getFetchOptions(pageParam);
    const poolsRepository = initializePoolsRepository();
    console.timeEnd('usePoolsQuery-init');
    console.time('usePoolsQuery-fetchpools');

    console.log(
      'Fetching with Query Args: ',
      fetchOptions,
      ' attrs: ',
      queryAttrs
    );
    const pools: Pool[] = await poolsRepository.fetch(fetchOptions);

    console.timeEnd('usePoolsQuery-fetchpools');
    console.timeEnd('usePoolsQuery-overall');
    console.log('RETRIEVED POOLS: ', pools);

    const skip = poolsRepository.currentProvider?.skip
      ? poolsRepository.currentProvider.skip
      : 0;

    return {
      pools,
      skip,
      enabled: true,
    };
  };

  const queryOptions = reactive({
    ...options,
    getNextPageParam: (lastPage: PoolsQueryResponse) => lastPage.skip,
    enabled,
  });

  return useInfiniteQuery<PoolsQueryResponse>(queryKey, queryFn, queryOptions);
}
