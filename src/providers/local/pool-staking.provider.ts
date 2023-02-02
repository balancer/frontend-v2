import usePoolGaugesQuery from '@/composables/queries/usePoolGaugesQuery';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import symbolKeys from '@/constants/symbol.keys';
import { bnum, getAddressFromPoolId, isSameAddress } from '@/lib/utils';
import { computed, inject, InjectionKey, provide } from 'vue';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';
import { getAddress } from '@ethersproject/address';
import { parseUnits } from '@ethersproject/units';
import { useTokens } from '../tokens.provider';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import useWeb3 from '@/services/web3/useWeb3';
import { POOLS } from '@/constants/pools';
import { useUserData } from '../user-data.provider';

/**
 * PoolStakingProvider
 *
 * Fetches data and provides functionality for a specific pool's gauge.
 */
const provider = (poolId: string) => {
  /**
   * STATE
   */
  const poolAddress = computed((): string => getAddressFromPoolId(poolId));

  /**
   * COMPOSABLES
   */
  const { balanceFor } = useTokens();
  const { account } = useWeb3();
  const { userGaugeSharesQuery, userBoostsQuery, stakedSharesQuery } =
    useUserData();
  const { data: userGaugeShares, refetch: refetchUserGaugeShares } =
    userGaugeSharesQuery;
  const { data: boostsMap, refetch: refetchUserBoosts } = userBoostsQuery;
  const {
    data: _stakedShares,
    refetch: refetchStakedShares,
    isRefetching: isRefetchingStakedShares,
  } = stakedSharesQuery;

  /**
   * QUERIES
   */
  // Fetches all gauges for this pool (incl. preferential gauge).
  const poolGaugesQuery = usePoolGaugesQuery(poolAddress);
  const { data: poolGauges, refetch: refetchPoolGauges } = poolGaugesQuery;

  /**
   * COMPUTED
   */
  const isLoading = computed(
    (): boolean =>
      isQueryLoading(poolGaugesQuery) ||
      isQueryLoading(stakedSharesQuery) ||
      isQueryLoading(userGaugeSharesQuery) ||
      isQueryLoading(userBoostsQuery)
  );

  const preferentialGaugeAddress = computed(
    (): string | undefined | null =>
      poolGauges.value?.pool?.preferentialGauge?.id
  );

  // Is it possible to stake this pool's BPT?
  const isStakablePool = computed(
    (): boolean =>
      poolGauges.value?.liquidityGauges?.[0]?.id !== undefined &&
      POOLS.Stakable.AllowList.includes(poolId)
  );

  // User's staked shares for pool (onchain data).
  const stakedShares = computed(
    (): string => _stakedShares?.value?.[poolId] || '0'
  );

  // User's boost value for this pool
  const boost = computed((): string => {
    if (!boostsMap.value) return '1';

    return boostsMap[poolId];
  });

  // Addresses of all pool gauges.
  const gaugeAddresses = computed(
    (): string[] => poolGauges.value?.pool.gauges.map(gauge => gauge.id) || []
  );

  // Map of user gauge addresses -> balance.
  const userGaugeSharesMap = computed((): Record<string, string> => {
    if (!userGaugeShares.value) return {};

    return userGaugeShares.value.reduce((acc, share) => {
      acc[share.gauge.id] = share.balance;
      return acc;
    }, {} as Record<string, string>);
  });

  // Does the user have a balance in a non-preferential gauge
  const hasNonPrefGaugeBalance = computed((): boolean => {
    if (
      !poolGauges.value ||
      !userGaugeShares.value ||
      !preferentialGaugeAddress.value
    )
      return false;

    const _preferentialGaugeAddress = preferentialGaugeAddress.value;

    return gaugeAddresses.value.some(
      gaugeAddress =>
        !isSameAddress(gaugeAddress, _preferentialGaugeAddress) &&
        bnum(userGaugeSharesMap.value[gaugeAddress] || '0').gt(0)
    );
  });

  /**
   * METHODS
   */
  async function refetchAllPoolStakingData() {
    return Promise.all([
      refetchPoolGauges.value(),
      refetchStakedShares.value(),
      refetchUserGaugeShares.value(),
      refetchUserBoosts.value(),
    ]);
  }

  /**
   * stake
   *
   * Trigger stake transaction using the current user's full BPT balance for
   * this pool.
   */
  async function stake(): Promise<TransactionResponse> {
    if (!preferentialGaugeAddress.value) {
      throw new Error(`No preferential gauge found for this pool.`);
    }

    const gauge = new LiquidityGauge(preferentialGaugeAddress.value);
    // User's current full BPT balance for this pool.
    const userBptBalance = parseUnits(
      balanceFor(getAddress(poolAddress.value))
    );

    return await gauge.stake(userBptBalance);
  }

  /**
   * unstake
   *
   * Trigger unstake transaction using the first pool gauge that the user has a
   * balance in.
   */
  async function unstake(): Promise<TransactionResponse> {
    if (!poolGauges.value?.pool?.gauges)
      throw new Error('Unable to unstake, no pool gauges');

    const gaugesWithBalance = await Promise.all(
      poolGauges.value.pool.gauges.map(async gauge => {
        const gaugeInstance = new LiquidityGauge(gauge.id);
        const balance = await gaugeInstance.balance(account.value);
        return { ...gauge, balance: balance?.toString() };
      })
    );

    const gaugeWithBalance = gaugesWithBalance.find(
      gauge => gauge.balance !== '0'
    );
    if (!gaugeWithBalance) {
      throw new Error(
        `Attempted to call unstake, user doesn't have any balance for any gauges.`
      );
    }

    const gauge = new LiquidityGauge(gaugeWithBalance.id);
    const balance = await gauge.balance(account.value);
    return await gauge.unstake(balance);
  }

  return {
    isLoading,
    stakedShares,
    isStakablePool,
    boost,
    hasNonPrefGaugeBalance,
    isRefetchingStakedShares,
    refetchStakedShares,
    refetchAllPoolStakingData,
    stake,
    unstake,
  };
};

/**
 * Provide setup: response type + symbol.
 */
export type Response = ReturnType<typeof provider>;
export const PoolStakingProviderSymbol: InjectionKey<Response> = Symbol(
  symbolKeys.Providers.PoolStaking
);

export function providePoolStaking(poolId: string) {
  provide(PoolStakingProviderSymbol, provider(poolId));
}

export function usePoolStaking(): Response {
  const defaultResponse = {} as Response;
  return inject(PoolStakingProviderSymbol, defaultResponse);
}
