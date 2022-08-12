import { flatten } from 'lodash';
import { computed, Ref, ref, watch } from 'vue';

import { POOLS } from '@/constants/pools';
import { forChange } from '@/lib/utils';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { Pool } from '@/services/pool/types';

import { lpTokensFor } from '../usePool';
import useTokens from '../useTokens';
import useUserSettings from '../useUserSettings';
import useGaugesQuery from './useGaugesQuery';
import { isQueryLoading } from './useQueryHelpers';
import useQueryStreams from './useQueryStream';

type FilterOptions = {
  poolIds?: Ref<string[]>;
  poolAddresses?: Ref<string[]>;
  isExactTokensList?: boolean;
  pageSize?: number;
};

async function fetchBasicPoolMetadata(
  tokenList: Ref<string[]> = ref([]),
  filterOptions?: FilterOptions,
  currentPage = 0
) {
  const skip =
    POOLS.Pagination.PerPage * (currentPage - 1 < 0 ? 0 : currentPage - 1);
  const tokensListFilterKey = filterOptions?.isExactTokensList
    ? 'tokensList'
    : 'tokensList_contains';
  const queryArgs: any = {
    first: filterOptions?.pageSize || POOLS.Pagination.PerPage,
    skip: skip,
    where: {
      [tokensListFilterKey]: tokenList.value,
      poolType_not_in: POOLS.ExcludedPoolTypes,
    },
  };
  const pools = await balancerSubgraphService.pools.get(queryArgs);
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

  watch(tokenList.value, () => {
    // Resets the query's "skip" variable and starts
    // searching pools always from the beginning when token filter changes
    currentPage.value = 1;
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
