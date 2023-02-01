import { computed, reactive, ref } from 'vue';

import useUserPoolsQuery from '@/composables/queries/useUserPoolsQuery';
import { useUserStaking } from '@/providers/local/user-staking.provider';
import { useUserData } from '@/providers/user-data.provider';
import usePoolsQuery from '../queries/usePoolsQuery';
import { Pool } from '@/services/pool/types';
import { fiatValueOf } from '../usePool';
import { isQueryLoading } from '../queries/useQueryHelpers';

/**
 * Provides user pools data. Primarily for the portfolio page.
 */
export default function useUserPools() {
  const {
    stakedPools,
    totalStakedValue,
    isLoading: isStakedDataLoading,
  } = useUserStaking();
  const { userPoolSharesQuery, lockQuery } = useUserData();
  const { data: userPoolShares } = userPoolSharesQuery;

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

  const totalUnstakedValue = computed((): number => {
    return Object.keys(userPoolShares.value || {}).reduce((acc, poolId) => {
      const pool = userPools.value.find(pool => pool.id === poolId);
      if (!pool) return acc;
      const bpt = userPoolShares?.value?.[poolId] || '0';
      return acc + Number(fiatValueOf(pool, bpt));
    }, 0);
  });

  const;

  const totalFiatValue = computed(
    (): number => totalUnstakedValue.value + totalStakedValue.value
  );

  const isLoading = computed(
    (): boolean =>
      isStakedDataLoading.value ||
      isQueryLoading(userPoolSharesQuery) ||
      isQueryLoading(unstakedPoolsQuery)
  );

  return {
    stakedPools,
    unstakedPools,
    totalFiatValue,
    isLoading,
  };
}
