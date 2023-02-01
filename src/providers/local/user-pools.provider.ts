import { computed, InjectionKey, provide, reactive, ref } from 'vue';
import { UserStakingResponse } from '@/providers/local/user-staking.provider';
import { useUserData } from '@/providers/user-data.provider';
import { Pool } from '@/services/pool/types';
import { bnSum } from '@/lib/utils';
import symbolKeys from '@/constants/symbol.keys';
import { safeInject } from '../inject';
import { useLock } from '@/composables/useLock';
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import { fiatValueOf } from '@/composables/usePool';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import { isVeBalSupported } from '@/composables/useVeBAL';

/**
 * Provides user pools data. Primarily for the portfolio page.
 */
export const provider = (userStaking: UserStakingResponse) => {
  const {
    stakedPools,
    totalStakedValue,
    isLoading: isStakedDataLoading,
  } = userStaking;

  const { userPoolSharesQuery, lockQuery } = useUserData();
  const { data: userPoolShares } = userPoolSharesQuery;

  const { totalLockedValue } = useLock();

  const unstakedPoolIds = computed((): string[] =>
    Object.keys(userPoolShares.value || {})
  );

  const isPoolsQueryEnabled = computed(
    (): boolean => unstakedPoolIds.value.length > 0
  );

  const unstakedPoolsQuery = usePoolsQuery(
    ref([]),
    reactive({
      enabled: isPoolsQueryEnabled,
    }),
    {
      poolIds: unstakedPoolIds,
      pageSize: 999,
    }
  );
  const { data: _unstakedPools } = unstakedPoolsQuery;

  // Pool records for all the pools where a user has staked BPT.
  const unstakedPools = computed(
    (): Pool[] => _unstakedPools.value?.pages[0].pools || []
  );

  const userPools = computed((): Pool[] => [
    ...unstakedPools.value,
    ...stakedPools.value,
  ]);

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

  return {
    stakedPools,
    unstakedPools,
    userPoolShares,
    totalFiatValue,
    isLoading,
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
