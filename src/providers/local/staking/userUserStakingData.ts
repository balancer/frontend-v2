import { formatUnits } from '@ethersproject/units';
import { useQuery } from '@tanstack/vue-query';
import { intersection } from 'lodash';
import { computed, reactive, Ref, ref } from 'vue';

import useGraphQuery, { subgraphs } from '@/composables/queries/useGraphQuery';
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import useUserPoolsQuery from '@/composables/queries/useUserPoolsQuery';
import { isL2 } from '@/composables/useNetwork';
import { POOLS } from '@/constants/pools';
import { bnum } from '@/lib/utils';
import { getBptBalanceFiatValue } from '@/lib/utils/balancer/pool';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';
import { PoolWithShares } from '@/services/pool/types';
import { stakingRewardsService } from '@/services/staking/staking-rewards.service';
import useWeb3 from '@/services/web3/useWeb3';
import BigNumber from 'bignumber.js';

export type UserGaugeShare = {
  id: string;
  gauge: {
    id: string;
    poolId: string;
    totalSupply: string;
  };
  balance: string;
};

export type UserLiquidityGauge = {
  id?: string;
  poolId: string;
  shares: {
    balance: string;
  }[];
};

export type UserGaugeSharesResponse = {
  gaugeShares: UserGaugeShare[];
  liquidityGauges: UserLiquidityGauge[];
};

export type PoolStakingDataResponse = {
  liquidityGauge: UserLiquidityGauge;
};

export type PoolGaugesInfo = {
  preferentialGauge: {
    id: string | null;
  };
  gauges: {
    id: string;
    relativeWeightCap: string;
  }[];
};

export type PoolGaugesResponse = {
  pools: PoolGaugesInfo[];
};

export default function useUserStakingData(poolAddress: Ref<string>) {
  /** COMPOSABLES */
  const { account, isWalletReady } = useWeb3();

  /**
   * QUERIES
   */
  const { data: userPoolsResponse, isInitialLoading: isLoadingUserPools } =
    useUserPoolsQuery();

  /** QUERY ARGS */
  const userPools = computed(() => userPoolsResponse.value?.pools || []);
  const stakeableUserPoolIds = computed(() =>
    intersection(userPoolIds.value, POOLS.Stakable.AllowList)
  );
  const userPoolIds = computed(() => {
    return userPools.value.map(pool => pool.id);
  });

  const {
    data: stakingData,
    isLoading: isLoadingUserStakingData,
    refetch: refetchUserStakingData,
  } = useGraphQuery<UserGaugeSharesResponse>(
    subgraphs.gauge,
    ['staking', 'data', { account, userPoolIds }],
    () => ({
      gaugeShares: {
        __args: {
          where: { user: account.value.toLowerCase(), balance_gt: '0' },
        },
        balance: true,
        gauge: {
          id: true,
          poolId: true,
          totalSupply: true,
        },
      },
      liquidityGauges: {
        __args: {
          where: {
            poolId_in: stakeableUserPoolIds.value,
          },
        },
        poolId: true,
      },
    }),
    reactive({
      refetchOnWindowFocus: false,
      enabled: true,
    })
  );

  // this query is responsible for checking gauge addresses for the pool
  const {
    data: poolGaugeAddressesResponse,
    isLoading: isLoadingGaugeAddresses,
  } = useGraphQuery<PoolGaugesResponse>(
    subgraphs.gauge,
    ['pool', 'gaugeAddresses', { poolAddress: poolAddress.value }],
    () => ({
      pools: {
        __args: {
          where: {
            address: poolAddress.value,
          },
        },
        preferentialGauge: {
          id: true,
        },
        gauges: {
          id: true,
          relativeWeightCap: true,
        },
      },
    }),
    reactive({
      enabled: !!poolAddress.value,
      refetchOnWindowFocus: false,
    })
  );

  const poolGaugeAddresses = computed(() => {
    return (
      poolGaugeAddressesResponse?.value?.pools[0] ||
      ({ preferentialGauge: { id: null }, gauges: [] } as PoolGaugesInfo)
    );
  });

  const isStakedSharesQueryEnabled = computed(
    () =>
      !!poolAddress.value &&
      poolAddress.value != '' &&
      isWalletReady.value &&
      !isLoadingGaugeAddresses.value
  );

  // we pull staked shares for a specific pool manually do to the
  // fact that the subgraph is too slow, so we gotta rely on the
  // contract. We want users to receive instant feedback that their
  // staked balances are updated
  const {
    data: stakedSharesResponse,
    isInitialLoading: isLoadingStakedShares,
    isRefetching: isRefetchingStakedShares,
    refetch: refetchStakedShares,
  } = useQuery<string>(
    ['staking', 'pool', 'shares', { account, poolAddress }],
    () => getStakedShares(),
    reactive({
      enabled: isStakedSharesQueryEnabled,
      refetchOnWindowFocus: false,
    })
  );

  /**
   * COMPUTED
   */
  // the amount of staked shares a user has for the
  // provided pool address to this instance, if there
  // is one. otherwise 0
  const stakedSharesForProvidedPool = computed(
    () => stakedSharesResponse.value || '0'
  );

  // a list of the gauge shares owned by that user
  // a gauge share represents the amount of staked
  // BPT a user has in a pool, given balance >= 0
  const userGaugeShares = computed(() => {
    if (!stakingData.value?.gaugeShares) return [];
    return stakingData.value.gaugeShares;
  });

  // a list of eligible gauges the user can stake into
  // this list is pulled against the users invested
  // pool ids
  const userLiquidityGauges = computed(() => {
    if (!stakingData.value?.liquidityGauges) return [];
    return stakingData.value.liquidityGauges;
  });

  const stakedSharesMap = computed(() => {
    return Object.fromEntries(
      userGaugeShares.value.map(gaugeShare => [
        gaugeShare.gauge.poolId,
        gaugeShare.balance,
      ])
    );
  });

  /** QUERY */
  const stakedPoolIds = computed(() => {
    if (isLoadingUserStakingData.value || !userGaugeShares.value) return [];
    return userGaugeShares.value.map(share => {
      return share.gauge.poolId;
    });
  });
  const isStakedPoolsQueryEnabled = computed(
    () => stakedPoolIds.value.length > 0
  );

  // isLoadingStakedPools is the loading flag for pulling actual pool data for the
  // staked pools, not to be confused with isLoadingUserStakingData
  // which is the flag for pulling gauge data
  const { data: stakedPoolsResponse, isInitialLoading: isLoadingStakedPools } =
    usePoolsQuery(
      ref([]),
      reactive({
        enabled: isStakedPoolsQueryEnabled,
      }),
      {
        poolIds: stakedPoolIds,
        pageSize: 999,
      }
    );

  const fetchedBalances = computed(() => !isLoadingStakedShares.value);
  const { data: hasNonPrefGaugeBalances, refetch: refetchHasNonPrefGauge } =
    useQuery<boolean>(
      ['gauges', 'hasNonPrefGaugeBalances', poolAddress, account],
      async () => {
        if (poolGaugeAddresses.value?.gauges?.length === 0) return false;

        const gaugeNonPrefBalances = await Promise.all(
          poolGaugeAddresses.value.gauges
            .filter(
              gauge =>
                gauge.id !== poolGaugeAddresses.value.preferentialGauge?.id
            )
            .map(async nonPrefGauge => {
              const gauge = new LiquidityGauge(nonPrefGauge.id);
              const balance = await gauge.balance(account.value);
              return balance?.toString();
            })
        );

        return gaugeNonPrefBalances.some(balance => balance !== '0');
      },
      reactive({
        enabled: fetchedBalances,
      })
    );

  const isBoostQueryEnabled = computed(
    () => isWalletReady.value && userGaugeShares.value.length > 0 && !isL2.value
  );

  const { data: poolBoosts, isInitialLoading: isLoadingBoosts } = useQuery<
    Record<string, string>
  >(
    ['gauges', 'boosts', { account, userGaugeShares }],
    async () => {
      const boosts = stakingRewardsService.getUserBoosts({
        userAddress: account.value,
        gaugeShares: userGaugeShares.value,
      });
      return boosts;
    },
    reactive({
      enabled: isBoostQueryEnabled,
    })
  );

  // a list of pools the user has a stake in
  const stakedPools = computed<PoolWithShares[]>(() => {
    return (stakedPoolsResponse.value?.pages[0].pools || []).map(pool => {
      const stakedBpt = stakedSharesMap.value[pool.id];
      return {
        ...pool,
        shares: getBptBalanceFiatValue(pool, stakedBpt),
        bpt: stakedBpt,
      };
    });
  });

  // Total fiat value of all staked pools for user
  const totalStakedFiatValue = computed((): string =>
    stakedPools.value
      .reduce((acc, { shares }) => acc.plus(shares), bnum(0))
      .toString()
  );

  /** METHODS */
  async function getStakedShares() {
    if (!poolAddress.value) {
      throw new Error(
        `Attempted to get staked shares, however useStaking was initialised without a pool address.`
      );
    }

    // sum balances from all gauges in the pool
    const totalBalance = await poolGaugeAddresses.value.gauges.reduce(
      async (totalPromise, value) => {
        const gauge = new LiquidityGauge(value.id);
        const balance = await gauge.balance(account.value);
        const total = await totalPromise;
        return total.plus(balance?.toString() || '0');
      },
      Promise.resolve(new BigNumber(0))
    );
    return formatUnits(totalBalance.toString(), 18);
  }

  function getBoostFor(poolId: string) {
    return (poolBoosts.value || {})[poolId] || '1';
  }

  return {
    userGaugeShares,
    userLiquidityGauges,
    stakedSharesForProvidedPool,
    isLoadingUserStakingData,
    // loading flag for pulling actual pool data for the
    // staked pools, not to be confused with isLoadingUserStakingData
    // which is the flag for pulling gauge data
    isLoadingStakedPools,
    isLoadingStakedShares,
    isRefetchingStakedShares,
    refetchStakedShares,
    isStakedPoolsQueryEnabled,
    isLoadingUserPools,
    stakedSharesMap,
    refetchUserStakingData,
    stakedPools,
    totalStakedFiatValue,
    poolBoosts,
    isLoadingBoosts,
    poolGaugeAddresses,
    hasNonPrefGaugeBalances,
    refetchHasNonPrefGauge,
    getStakedShares,
    getBoostFor,
  };
}

export type UserStakingData = ReturnType<typeof useUserStakingData>;
