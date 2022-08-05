import { flatten } from 'lodash';
import { computed, Ref, ref, watch } from 'vue';

import { POOLS } from '@/constants/pools';
import { forChange } from '@/lib/utils';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import queryBuilder from '@/services/balancer/subgraph/entities/pools/query';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { Pool } from '@/services/pool/types';

import { lpTokensFor } from '../usePool';
import useTokens from '../useTokens';
import useUserSettings from '../useUserSettings';
import useGaugesQuery from './useGaugesQuery';
import { isQueryLoading } from './useQueryHelpers';
import useQueryStreams from './useQueryStream';
import { GraphQLArgs, Op, PoolsBalancerAPIRepository, PoolsSubgraphRepository } from '@balancer-labs/sdk';
import { configService } from '@/services/config/config.service';

type FilterOptions = {
  poolIds?: Ref<string[]>;
  poolAddresses?: Ref<string[]>;
  isExactTokensList?: boolean;
  pageSize?: number;
};

function initializePoolsRepository() {
  const balancerApiRepository = new PoolsBalancerAPIRepository(configService.network.balancerApi || '', configService.network.keys.balancerApi || '');
  const subgraphRepository = new PoolsSubgraphRepository(configService.network.subgraph);
  // const fallbackRepository = new PoolsFallback

  return balancerApiRepository;
}

async function fetchBasicPoolMetadata(
  tokenList: Ref<string[]> = ref([]),
  filterOptions?: FilterOptions,
  currentPage = 0
) {
  const skip =
    POOLS.Pagination.PerPage * (currentPage - 1 < 0 ? 0 : currentPage - 1);
  const tokensListFilterKey = filterOptions?.isExactTokensList
    ? 'is'
    : 'contains';
  const queryArgs: GraphQLArgs = {
    chainId: configService.network.chainId,
    first: filterOptions?.pageSize || POOLS.Pagination.PerPage,
    skip: skip,
    where: {
      tokensList: Op.Contains(tokenList.value),
      poolType: Op.NotIn(POOLS.ExcludedPoolTypes)
    }
  };

  const queryAttrs = {
    id: true,
    address: true,
    poolType: true,
    swapFee: true,
    tokensList: true,
    totalLiquidity: true,
    totalSwapVolume: true,
    totalSwapFee: true,
    totalShares: true,
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
  };

  const poolsRepository = initializePoolsRepository();
  const pools = await poolsRepository.fetch({
    args: queryArgs,
    attrs: queryAttrs
  });

  return pools;
}

export default function useStreamedPoolsQuery(
  tokenList: Ref<string[]> = ref([]),
  filterOptions?: FilterOptions
) {
  const {
    priceQueryLoading,
    prices,
    tokens,
    injectTokens,
    dynamicDataLoading,
  } = useTokens();
  const { currency } = useUserSettings();
  const gaugesQuery = useGaugesQuery();

  const decorationEnabled = computed(
    (): boolean => !priceQueryLoading.value && !isQueryLoading(gaugesQuery)
  );

  const {
    dataStates,
    result,
    loadMore,
    currentPage,
    isLoadingMore,
    isComplete,
  } = useQueryStreams('pools', {
    basic: {
      init: true,
      dependencies: { tokenList },
      queryFn: async (_, __, currentPage: Ref<number>) => {
        return await fetchBasicPoolMetadata(
          tokenList,
          filterOptions,
          currentPage.value
        );
      },
    },
    injectTokens: {
      waitFor: ['basic.id'],
      queryFn: async (pools: Ref<Pool[]>) => {
        const _tokens = flatten(
          pools.value.map(pool => [
            ...pool.tokensList,
            ...lpTokensFor(pool),
            pool.address,
          ])
        );
        await injectTokens(_tokens);
        await forChange(dynamicDataLoading, false);
        return () => pools.value;
      },
    },
    decoratePools: {
      waitFor: ['injectTokens.id'],
      enabled: decorationEnabled,
      queryFn: async (pools: Ref<Pool[]>) => {
        const poolDecorator = new PoolDecorator(pools.value);
        return poolDecorator.decorate(
          gaugesQuery.data.value || [],
          prices.value,
          currency.value,
          tokens.value
        );
      },
    },
  });

  watch(
    () => result.value,
    val => {
      if (val.length > 0) {
        poolsStoreService.setPools(val);
      }
    },
    { deep: true }
  );

  return {
    dataStates,
    result,
    loadMore,
    currentPage,
    isLoadingMore,
    isComplete,
  };
}
