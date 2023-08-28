/**
 * Provides all user staking related data.
 */
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import { fiatValueOf } from '@/composables/usePoolHelpers';
import symbolKeys from '@/constants/symbol.keys';
import { Pool } from '@/services/pool/types';
import { computed, InjectionKey, provide } from 'vue';
import { safeInject } from '../inject';
import { useUserData } from '../user-data.provider';

const provider = () => {
  /**
   * COMPOSABLES
   */
  const { userGaugeSharesQuery, userBoostsQuery, stakedSharesQuery } =
    useUserData();

  /**
   * COMPUTED
   */
  const { data: userGaugeShares } = userGaugeSharesQuery;
  const { data: poolBoostsMap } = userBoostsQuery;
  const { data: stakedShares } = stakedSharesQuery;

  // Array of all the pools a user has staked BPT for.
  const stakedPoolIds = computed((): string[] => {
    if (!userGaugeShares.value) return [];

    return userGaugeShares.value.map(gaugeShare => gaugeShare.gauge.poolId);
  });

  const isPoolsQueryEnabled = computed(
    (): boolean => stakedPoolIds.value.length > 0
  );

  const filterOptions = computed(() => ({
    poolIds: stakedPoolIds.value,
    pageSize: 999,
  }));

  const stakedPoolsQuery = usePoolsQuery(filterOptions, {
    enabled: isPoolsQueryEnabled,
  });
  const { data: _stakedPools, refetch: refetchStakedPools } = stakedPoolsQuery;

  // Pool records for all the pools where a user has staked BPT.
  const stakedPools = computed(
    (): Pool[] => _stakedPools.value?.pages[0].pools || []
  );

  // Total fiat value of staked shares.
  const totalStakedValue = computed((): string => {
    return Object.keys(stakedShares.value || {})
      .reduce((acc, poolId) => {
        const pool = stakedPools.value.find(pool => pool.id === poolId);
        if (!pool) return acc;
        const bpt = stakedShares?.value?.[poolId] || '0';
        return acc + Number(fiatValueOf(pool, bpt));
      }, 0)
      .toString();
  });

  // Is loading any user staking data?
  const isLoading = computed((): boolean => {
    return (
      isQueryLoading(userGaugeSharesQuery) ||
      isQueryLoading(stakedSharesQuery) ||
      isQueryLoading(userBoostsQuery) ||
      isQueryLoading(stakedPoolsQuery)
    );
  });

  /**
   * Gets a user's staked BPT balance for a given pool.
   *
   * @param {string} poolId - The pool to get the staked balance for.
   * @returns The staked balance.
   */
  function stakedSharesFor(poolId: string): string {
    return stakedShares?.value?.[poolId] || '0';
  }

  return {
    stakedPools,
    stakedShares,
    poolBoostsMap,
    totalStakedValue,
    isLoading,
    refetchStakedPools,
    stakedSharesFor,
  };
};

/**
 * Provide setup: response type + symbol.
 */
export type UserStakingResponse = ReturnType<typeof provider>;
export const UserStakingProviderSymbol: InjectionKey<UserStakingResponse> =
  Symbol(symbolKeys.Providers.UserStaking);

export function provideUserStaking(): UserStakingResponse {
  const _provider = provider();
  provide(UserStakingProviderSymbol, _provider);
  return _provider;
}

export function useUserStaking(): UserStakingResponse {
  return safeInject(UserStakingProviderSymbol);
}
