import { getAddress } from 'ethers/lib/utils';
import { keyBy } from 'lodash';
import { computed, Ref, ref } from 'vue';

import { FiatCurrency } from '@/constants/currency';
import { POOLS } from '@/constants/pools';
import { bnum } from '@/lib/utils';
import { getPoolAddress } from '@/lib/utils/balancer/pool';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { SubgraphGauge } from '@/services/balancer/gauges/types';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { DecoratedPool, Pool } from '@/services/balancer/subgraph/types';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import PoolService from '@/services/pool/pool.service';
import { stakingRewardsService } from '@/services/staking/staking-rewards.service';
import { web3Service } from '@/services/web3/web3.service';
import { TokenInfoMap } from '@/types/TokenList';

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

function formatPools(pools: Pool[]) {
  return pools.map(pool => {
    const poolService = new PoolService(pool);
    return {
      ...pool,
      address: getPoolAddress(pool.id),
      tokenAddresses: pool.tokensList.map(token => getAddress(token)),
      tokens: poolService.formatPoolTokens()
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
  gauges: SubgraphGauge[],
  prices: TokenPrices,
  currency: FiatCurrency,
  pastPools: DecoratedPool[],
  protocolFeePercentage: number,
  tokens: TokenInfoMap
) {
  const pastPoolsMap = keyBy(pastPools, 'id');
  const decorated = pools.map(async pool => {
    const poolService = new PoolService(pool);
    const {
      thirdPartyAPR,
      thirdPartyAPRBreakdown
    } = await poolService.calcThirdPartyAPR(
      prices,
      currency,
      protocolFeePercentage
    );

    const gaugeBALAprs = await stakingRewardsService.getGaugeBALAprs({
      prices,
      gauges,
      pools
    });

    const rewardAprs = await stakingRewardsService.getRewardTokenAprs({
      prices,
      tokens,
      gauges,
      pools
    });

    if (!pool.dynamic) pool.dynamic = {} as any;
    if (!pool.dynamic.apr) pool.dynamic.apr = {} as any;
    if (!pool.dynamic.apr.staking)
      pool.dynamic.apr.staking = {
        BAL: gaugeBALAprs[pool.id] || { min: '0', max: '0' },
        Rewards: rewardAprs[pool.id] || '0'
      };

    pool.dynamic.apr.thirdParty = thirdPartyAPR;
    pool.dynamic.apr.thirdPartyBreakdown = thirdPartyAPRBreakdown;

    // staking aprs
    pool.dynamic.apr.staking.BAL = gaugeBALAprs[pool.id];

    const poolAPR = poolService.calcAPR(
      pastPoolsMap[pool.id],
      protocolFeePercentage
    );
    const fees = poolService.calcFees(pastPoolsMap[pool.id]);

    const totalApr = bnum(poolAPR).plus(thirdPartyAPR);

    pool.dynamic.fees = fees;
    pool.dynamic.apr.total = totalApr.toString();

    return pool;
  });
  return await Promise.all(decorated);
}

export default function useStreamedPoolsQuery(
  tokenList: Ref<string[]> = ref([]),
  filterOptions?: FilterOptions
) {
  const { priceQueryLoading, prices, tokens } = useTokens();
  const { currency } = useUserSettings();
  const { data: subgraphGauges } = useGaugesQuery();
  const isNotLoadingPrices = computed(() => {
    return !priceQueryLoading.value;
  });

  const {
    dataStates,
    result,
    loadMore,
    currentPage,
    isLoadingMore
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
      }
    },
    protocolFee: {
      type: 'independent',
      queryFn: async () =>
        balancerContractsService.vault.protocolFeesCollector.getSwapFeePercentage()
    },
    formatPools: {
      waitFor: ['liquidity.id'],
      queryFn: async (pools: Ref<Pool[]>) => {
        return formatPools(pools.value);
      }
    },
    liquidity: {
      dependencies: { prices, currency },
      enabled: isNotLoadingPrices,
      waitFor: ['basic.id'],
      queryFn: async (pools: Ref<Pool[]>) => {
        return decorateWithTotalLiquidity(pools, prices.value, currency.value);
      }
    },
    timeTravelBlock: {
      type: 'independent',
      queryFn: async () => web3Service.getTimeTravelBlock('24h')
    },
    historicalPools: {
      waitFor: ['timeTravelBlock', 'basic.id'],
      type: 'page_dependent',
      queryFn: async (pools: Ref<DecoratedPool[]>, data: Ref<any>) => {
        return fetchHistoricalPools(data.value.timeTravelBlock, pools.value);
      }
    },
    volume: {
      waitFor: ['basic.id', 'historicalPools.id'],
      queryFn: async (pools: Ref<DecoratedPool[]>, data: Ref<any>) => {
        const withVolumes = await decorateWithVolumes(
          data.value.historicalPools,
          pools.value
        );
        return withVolumes;
      }
    },
    aprs: {
      waitFor: ['protocolFee', 'historicalPools.id', 'formatPools.id'],
      enabled: isNotLoadingPrices,
      queryFn: async (pools: Ref<DecoratedPool[]>, data: Ref<any>) => {
        return await decorateWithAPRs(
          pools.value,
          subgraphGauges.value || [],
          prices.value,
          currency.value,
          data.value.historicalPools,
          data.value.protocolFee,
          tokens.value
        );
      }
    }
  });

  return {
    dataStates,
    result,
    loadMore,
    currentPage,
    isLoadingMore
  };
}
