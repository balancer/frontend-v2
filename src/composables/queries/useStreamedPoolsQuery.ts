import { computed, Ref, ref, watch } from 'vue';
import { UseInfiniteQueryOptions } from 'vue-query';

import { FiatCurrency } from '@/constants/currency';
import { POOLS } from '@/constants/pools';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { DecoratedPool, Pool } from '@/services/balancer/subgraph/types';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import PoolService from '@/services/pool/pool.service';

import useApp from '../useApp';
import useNetwork from '../useNetwork';
import useTokens from '../useTokens';
import useUserSettings from '../useUserSettings';
import useGaugesQuery from './useGaugesQuery';
import useQueryStreams from './useQueryStream';

type PoolsQueryResponse = {
  pools: DecoratedPool[];
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

async function fetchBasicPoolMetadata(
  tokenList: Ref<string[]> = ref([]),
  filterOptions?: FilterOptions
) {
  const tokensListFilterKey = filterOptions?.isExactTokensList
    ? 'tokensList'
    : 'tokensList_contains';
  const queryArgs: any = {
    first: filterOptions?.pageSize || POOLS.Pagination.PerPage,
    skip: 0,
    where: {
      [tokensListFilterKey]: tokenList.value,
      poolType_not_in: POOLS.ExcludedPoolTypes
    }
  };
  const pools = await balancerSubgraphService.pools.get(queryArgs);
  // d.value = pools;
  return pools;
}

function fetchLiquidityForPools(
  pools: Pool[] = [],
  prices: TokenPrices,
  currency: FiatCurrency
): Pool[] {
  const withTotalLiquidity = pools.map(pool => {
    const poolService = new PoolService(pool);
    pool.totalLiquidity = poolService.calcTotalLiquidity(prices, currency);
    return pool;
  });
  return withTotalLiquidity;
}

export default function useStreamedPoolsQuery(
  tokenList: Ref<string[]> = ref([]),
  options: UseInfiniteQueryOptions<PoolsQueryResponse> = {},
  filterOptions?: FilterOptions
) {
  const {
    injectTokens,
    dynamicDataLoading,
    prices,
    getTokens,
    tokens: tokenMeta
  } = useTokens();
  const { currency } = useUserSettings();
  const { appLoading } = useApp();
  const { networkId } = useNetwork();
  const { data: subgraphGauges } = useGaugesQuery();
  const gaugeAddresses = computed(() =>
    (subgraphGauges.value || []).map(gauge => gauge.id)
  );
  //   const queryKey = [
  //     networkId,
  //     tokenList,
  //     filterOptions?.poolIds,
  //     filterOptions?.poolAddresses,
  //     gaugeAddresses
  //   ]
  const shouldFetchLiquidity = computed(() => !dynamicDataLoading.value);

  const { data, dataStates, result } = useQueryStreams('pools', {
    basic: {
      init: true,
      queryFn: async () => {
        return fetchBasicPoolMetadata(tokenList, filterOptions);
      }
    },
    liquidity: {
      dependencies: { prices, currency },
      enabled: shouldFetchLiquidity,
      queryFn: async (pools: Pool[]) => {
        return fetchLiquidityForPools(pools, prices.value, currency.value);
      }
    }
  });
  return {
    data,
    dataStates,
    result
  };
}
