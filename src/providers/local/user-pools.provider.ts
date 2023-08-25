import { InjectionKey } from 'vue';
import { UserStakingResponse } from '@/providers/local/user-staking.provider';
import { useUserData } from '@/providers/user-data.provider';
import { Pool, PoolType, allLinearTypes } from '@/services/pool/types';
import { bnSum } from '@/lib/utils';
import symbolKeys from '@/constants/symbol.keys';
import { safeInject } from '../inject';
import { useLock } from '@/composables/useLock';
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import { fiatValueOf } from '@/composables/usePoolHelpers';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import { isVeBalSupported } from '@/composables/useVeBAL';
import { useTokens } from '../tokens.provider';
import { POOLS } from '@/constants/pools';

/**
 * Provides user pools data. Primarily for the portfolio page.
 */
export const provider = (userStaking: UserStakingResponse) => {
  const {
    stakedPools,
    totalStakedValue,
    refetchStakedPools,
    isLoading: isStakedDataLoading,
  } = userStaking;

  // Access user data fetched on wallet connection/change.
  const { userPoolSharesQuery, lockQuery } = useUserData();
  const { data: userPoolShares, refetch: refetchUserPoolShares } =
    userPoolSharesQuery;

  const { totalLockedValue } = useLock();
  const { injectTokens } = useTokens();

  // Array of pool IDs that the user hasn't staked.
  const unstakedPoolIds = computed((): string[] =>
    Object.keys(userPoolShares.value || {})
  );

  // Only fetch unstaked pools if the user has pool shares.
  const isPoolsQueryEnabled = computed(
    (): boolean => unstakedPoolIds.value.length > 0
  );

  // Fetch pools that the user hasn't staked.
  const filterOptions = computed(() => ({
    poolIds: unstakedPoolIds.value,
    pageSize: 999,
    poolTypes: [...POOLS.IncludedPoolTypes, ...allLinearTypes] as PoolType[],
  }));
  const unstakedPoolsQuery = usePoolsQuery(filterOptions, {
    enabled: isPoolsQueryEnabled,
  });
  const { data: _unstakedPools } = unstakedPoolsQuery;

  // Helper property to drill down to first page of results.
  const unstakedPools = computed(
    (): Pool[] => _unstakedPools.value?.pages[0].pools || []
  );

  // Combine staked and unstaked pools.
  const userPools = computed((): Pool[] => [
    ...unstakedPools.value,
    ...stakedPools.value,
  ]);

  // Total fiat value of unstaked positions.
  const totalUnstakedValue = computed((): string => {
    return Object.keys(userPoolShares.value || {})
      .reduce((acc, poolId) => {
        const pool = userPools.value.find(pool => pool.id === poolId);
        if (!pool) return acc;
        const bpt = userPoolShares?.value?.[poolId] || '0';
        return acc + Number(fiatValueOf(pool, bpt));
      }, 0)
      .toString();
  });

  // Total portfolio fiat value, including staked, unstaked, and locked positions.
  const totalFiatValue = computed((): string =>
    bnSum([
      totalUnstakedValue.value,
      totalStakedValue.value,
      totalLockedValue.value,
    ]).toString()
  );

  const isLoading = computed(
    (): boolean =>
      isStakedDataLoading.value ||
      isQueryLoading(userPoolSharesQuery) ||
      isQueryLoading(unstakedPoolsQuery) ||
      (isVeBalSupported.value && isQueryLoading(lockQuery))
  );

  // Trigger refetch of queries for staked and unstaked pools.
  async function refetchAllUserPools() {
    await Promise.all([refetchUserPoolShares(), refetchStakedPools()]);
  }

  // Whenever new pools show up in the user pools array, inject their tokens so
  // that we can add the user's balance to the token registry.
  watch(userPools, newUserPools => {
    injectTokens(newUserPools.map(pool => pool.address));
  });

  return {
    stakedPools,
    unstakedPools,
    userPoolShares,
    totalFiatValue,
    isLoading,
    refetchAllUserPools,
  };
};

export type UserPoolsProviderResponse = ReturnType<typeof provider>;
export const UserPoolsProviderSymbol: InjectionKey<UserPoolsProviderResponse> =
  Symbol(symbolKeys.Providers.UserPools);

export function providerUserPools(userStaking: UserStakingResponse) {
  provide(UserPoolsProviderSymbol, provider(userStaking));
}

export function useUserPools(): UserPoolsProviderResponse {
  return safeInject(UserPoolsProviderSymbol);
}
