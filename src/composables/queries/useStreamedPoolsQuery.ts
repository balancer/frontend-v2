import { PoolBalanceOpKind } from '@balancer-labs/sdk';
import { getAddress } from 'ethers/lib/utils';
import { keyBy } from 'lodash';
import { computed, Ref, ref, watch } from 'vue';

import { FiatCurrency } from '@/constants/currency';
import { POOLS } from '@/constants/pools';
import { bnum } from '@/lib/utils';
import { getPoolAddress } from '@/lib/utils/balancer/pool';
import { getExcludedAddresses } from '@/lib/utils/liquidityMining';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { ExcludedAddresses } from '@/services/balancer/subgraph/entities/pools/helpers';
import { DecoratedPool, Pool } from '@/services/balancer/subgraph/types';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import PoolService from '@/services/pool/pool.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

import { isStablePhantom } from '../usePool';
import useTokens from '../useTokens';
import useUserSettings from '../useUserSettings';
import useGaugesQuery from './useGaugesQuery';
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
      poolType_not_in: POOLS.ExcludedPoolTypes
    }
  };
  const pools = await balancerSubgraphService.pools.get(queryArgs);
  return pools;
}

function formatPools(pools: Pool[], excludedAddresses: ExcludedAddresses) {
  console.log(
    'formatio',
    pools.map(pool => pool.tokensList.map(token => getAddress(token)))
  );
  return pools.map(pool => {
    const poolService = new PoolService(pool);
    return {
      ...pool,
      address: getPoolAddress(pool.id),
      tokenAddresses: pool.tokensList.map(token => getAddress(token)),
      tokens: poolService.formatPoolTokens(),
      miningTotalLiquidity: poolService.removeExcludedAddressesFromTotalLiquidity(
        pool.totalLiquidity,
        excludedAddresses
      )
    };
  });
}

async function decorateWithTotalLiquidity(
  pools: Ref<Pool[]>,
  prices: TokenPrices,
  currency: FiatCurrency
): Promise<Pool[]> {
  const withTotalLiquidity = (pools.value || []).map(async pool => {
    const poolService = new PoolService(pool);
    const isStablePhantomPool = isStablePhantom(pool.poolType);

    if (isStablePhantomPool) {
      pool = poolService.removePreMintedBPT();
      pool = await poolService.decorateWithLinearPoolAttrs();
    }
    pool.totalLiquidity = poolService.calcTotalLiquidity(prices, currency);

    return pool;
  });
  return await Promise.all(withTotalLiquidity);
}

function calcVolume(pool: Pool, pastPool: Pool | undefined): string {
  if (!pastPool) return pool.totalSwapVolume;

  return bnum(pool.totalSwapVolume)
    .minus(pastPool.totalSwapVolume)
    .toString();
}

async function fetchHistoricalPools(
  blockNumber: number,
  pools: DecoratedPool[]
) {
  const block = { number: blockNumber };
  const isInPoolIds = { id_in: pools.map(pool => pool.id) };
  const pastPoolQuery = await balancerSubgraphService.pools.query({
    where: isInPoolIds,
    block
  });
  let pastPools: Pool[] | null = null;
  try {
    const data: { pools: Pool[] } = await balancerSubgraphService.client.get(
      pastPoolQuery
    );
    pastPools = data.pools;
  } catch {
    return pools;
  }
  return pastPools;
}

function decorateWithVolumes(historicalPools: Pool[], pools: DecoratedPool[]) {
  if (!historicalPools || !historicalPools.length) return pools;
  const pastPoolMap = keyBy(historicalPools, 'id');
  return pools.map(pool => {
    const volume = calcVolume(pool, pastPoolMap[pool.id]);
    if (!pool.dynamic) {
      pool.dynamic = {} as any;
      pool.dynamic.volume = volume;
    }
    return pool;
  });
}

async function decorateWithAPRs(
  pools: DecoratedPool[],
  prices: TokenPrices,
  currency: FiatCurrency,
  pastPools: DecoratedPool[],
  protocolFeePercentage: number
) {
  const pastPoolsMap = keyBy(pastPools, 'id');
  return pools.map(async pool => {
    const poolService = new PoolService(pool);
    const {
      hasLiquidityMiningRewards,
      liquidityMiningAPR,
      liquidityMiningBreakdown
    } = poolService.calcLiquidityMiningAPR(prices, currency);

    const {
      thirdPartyAPR,
      thirdPartyAPRBreakdown
    } = await poolService.calcThirdPartyAPR(
      prices,
      currency,
      protocolFeePercentage
    );
    if (!pool.dynamic) pool.dynamic = {} as any;
    if (!pool.dynamic.apr) pool.dynamic.apr = {} as any;

    pool.dynamic.apr.thirdParty = thirdPartyAPR;
    pool.dynamic.apr.thirdPartyBreakdown = thirdPartyAPRBreakdown;
    pool.dynamic.apr.liquidityMining = liquidityMiningAPR;
    pool.dynamic.apr.liquidityMiningBreakdown = liquidityMiningBreakdown;
    pool.hasLiquidityMiningRewards = hasLiquidityMiningRewards;

    const poolAPR = poolService.calcAPR(
      pastPoolsMap[pool.id],
      protocolFeePercentage
    );
    const fees = poolService.calcFees(pastPoolsMap[pool.id]);

    const totalApr = bnum(poolAPR)
      .plus(liquidityMiningAPR)
      .plus(thirdPartyAPR);

    pool.dynamic.fees = fees;
    pool.dynamic.apr.total = totalApr.toString();

    return pools;
  });
}

export default function useStreamedPoolsQuery(
  tokenList: Ref<string[]> = ref([]),
  filterOptions?: FilterOptions
) {
  const { priceQueryLoading, prices } = useTokens();
  const { currency } = useUserSettings();
  const { data: subgraphGauges } = useGaugesQuery();
  (subgraphGauges.value || []).map(gauge => gauge.id);
  const isNotLoadingPrices = computed(() => {
    return !priceQueryLoading.value;
  });

  const {
    data,
    dataStates,
    result,
    loadMore,
    currentPage,
    isLoadingMore,
    successStates,
  } = useQueryStreams('pools', {
    basic: {
      init: true,
      queryFn: async (_, __, currentPage: Ref<number>) => {
        return fetchBasicPoolMetadata(
          tokenList,
          filterOptions,
          currentPage.value
        );
      }
    },
    excludedAddresses: {
      type: 'independent',
      queryFn: async () => getExcludedAddresses()
    },
    protocolFee: {
      type: 'independent',
      queryFn: async () =>
        balancerContractsService.vault.protocolFeesCollector.getSwapFeePercentage()
    },
    formatPools: {
      waitFor: ['excludedAddresses', 'basic'],
      queryFn: async (pools: Ref<Pool[]>, data: Ref<any>, _, successStates) => {
        console.log('succ f', JSON.stringify(successStates.value));

        return formatPools(pools.value, data.value.excludedAddresses);
      }
    },
    liquidity: {
      dependencies: { prices, currency },
      enabled: isNotLoadingPrices,
      waitFor: ['basic'],
      queryFn: async (pools: Ref<Pool[]>) => {
        return decorateWithTotalLiquidity(pools, prices.value, currency.value);
      }
    },
    timeTravelBlock: {
      type: 'independent',
      queryFn: async () => rpcProviderService.getTimeTravelBlock('24h')
    },
    historicalPools: {
      waitFor: ['timeTravelBlock', 'basic'],
      type: 'page_dependent',
      queryFn: async (pools: Ref<DecoratedPool[]>, data: Ref<any>) => {
        return fetchHistoricalPools(data.value.timeTravelBlock, pools.value);
      }
    },
    volume: {
      waitFor: ['basic', 'historicalPools'],
      queryFn: async (pools: Ref<DecoratedPool[]>, data: Ref<any>) => {
        const withVolumes = await decorateWithVolumes(
          data.value.historicalPools,
          pools.value
        );
        return withVolumes;
      }
    },
    aprs: {
      waitFor: ['protocolFee', 'historicalPools', 'formatPools', 'basic'],
      enabled: isNotLoadingPrices,
      streamResponses: true,
      queryFn: async (
        pools: Ref<DecoratedPool[]>,
        data: Ref<any>,
        _,
        successStates
      ) => {
        console.log('succ a', JSON.stringify(successStates.value));
        return await decorateWithAPRs(
          pools.value,
          prices.value,
          currency.value,
          data.value.historicalPools,
          data.value.protocolFee
        );
      }
    }
  });

  watch(successStates, () => {
    console.log('succ', JSON.stringify(successStates.value))
  })

  return {
    data,
    dataStates,
    result,
    loadMore,
    currentPage,
    isLoadingMore
  };
}
