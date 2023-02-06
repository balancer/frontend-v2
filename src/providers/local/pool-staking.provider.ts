import usePoolGaugesQuery from '@/composables/queries/usePoolGaugesQuery';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import usePoolStakedSharesQuery from '@/composables/queries/usePoolStakedSharesQuery';
import symbolKeys from '@/constants/symbol.keys';
import { bnum, getAddressFromPoolId, isSameAddress } from '@/lib/utils';
import { computed, InjectionKey, provide } from 'vue';
import useUserGaugeSharesQuery from '@/composables/queries/useUserGaugeSharesQuery';
import useUserBoostsQuery from '@/composables/queries/useUserBoostsQuery';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';
import { getAddress } from '@ethersproject/address';
import { parseUnits } from '@ethersproject/units';
import { useTokens } from '../tokens.provider';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import useWeb3 from '@/services/web3/useWeb3';
import { POOLS } from '@/constants/pools';
import { safeInject } from '../inject';

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
  const { account, isWalletReady } = useWeb3();

  /**
   * QUERIES
   */
  // Fetches all gauges for this pool (incl. preferential gauge).
  const poolGaugesQuery = usePoolGaugesQuery(poolAddress);
  const { data: poolGauges, refetch: refetchPoolGauges } = poolGaugesQuery;

  // Fetches the user's total staked shares for this pool using onchain calls.
  const poolStakedSharesQuery = usePoolStakedSharesQuery(poolGauges);
  const {
    data: _stakedShares,
    isRefetching: isRefetchingStakedShares,
    refetch: refetchStakedShares,
  } = poolStakedSharesQuery;

  // Fetches user's gaugeShare for pool, to be used in boost calculation.
  const userGaugeSharesQuery = useUserGaugeSharesQuery(poolAddress);
  const { data: userGaugeShares, refetch: refetchUserGaugeShares } =
    userGaugeSharesQuery;

  // Fetches user's boost value for this pool.
  const userBoostsQuery = useUserBoostsQuery(userGaugeShares);
  const { data: boostsMap, refetch: refetchUserBoosts } = userBoostsQuery;

  /**
   * COMPUTED
   */
  const isLoading = computed(
    (): boolean =>
      isQueryLoading(poolGaugesQuery) ||
      (isWalletReady.value &&
        (isQueryLoading(poolStakedSharesQuery) ||
          isQueryLoading(userGaugeSharesQuery) ||
          isQueryLoading(userBoostsQuery)))
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
  const stakedShares = computed((): string => _stakedShares.value || '0');

  // User's boost value for this pool
  const boost = computed((): string => {
    if (!boostsMap.value) return '1';

    return boostsMap[poolId];
  });

  // Does the user have a balance in a non-preferential gauge
  const hasNonPrefGaugeBalance = computed((): boolean => {
    if (!userGaugeShares.value || !preferentialGaugeAddress.value) return false;

    const _preferentialGaugeAddress = preferentialGaugeAddress.value;

    return userGaugeShares.value.some(
      gauge =>
        !isSameAddress(gauge.gauge.id, _preferentialGaugeAddress) &&
        bnum(gauge.balance).gt(0)
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
export type PoolStakingProviderResponse = ReturnType<typeof provider>;
export const PoolStakingProviderSymbol: InjectionKey<PoolStakingProviderResponse> =
  Symbol(symbolKeys.Providers.PoolStaking);

export function providePoolStaking(poolId: string) {
  provide(PoolStakingProviderSymbol, provider(poolId));
}

export function usePoolStaking(): PoolStakingProviderResponse {
  return safeInject(PoolStakingProviderSymbol);
}
