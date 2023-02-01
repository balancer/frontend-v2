/**
 * Provides all user staking related data.
 */
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import { fiatValueOf } from '@/composables/usePool';
import symbolKeys from '@/constants/symbol.keys';
import { Pool } from '@/services/pool/types';
import { computed, InjectionKey, provide, reactive, ref } from 'vue';
import { safeInject } from '../inject';
import { useUserData } from '../user-data.provider';

const provider = () => {
  /**
   * COMPOSABLES
   */
  const { userGaugeSharesQuery, userBoostsQuery } = useUserData();

  /**
   * COMPUTED
   */
  const { data: userGaugeShares } = userGaugeSharesQuery;
  const { data: poolBoostsMap } = userBoostsQuery;

  // Array of all the pools a user has staked BPT for.
  const stakedPoolIds = computed((): string[] => {
    if (!userGaugeShares.value) return [];

    return userGaugeShares.value.map(gaugeShare => gaugeShare.gauge.poolId);
  });

  // Map of poolID -> staked BPT balance.
  const stakedBptMap = computed((): Record<string, string> => {
    return Object.fromEntries(
      (userGaugeShares.value || []).map(gaugeShare => [
        gaugeShare.gauge.poolId,
        gaugeShare.balance,
      ])
    );
  });

  const isPoolsQueryEnabled = computed(
    (): boolean => stakedPoolIds.value.length > 0
  );

  const stakedPoolsQuery = usePoolsQuery(
    ref([]),
    reactive({
      enabled: isPoolsQueryEnabled,
    }),
    {
      poolIds: stakedPoolIds,
      pageSize: 999,
    }
  );
  const { data: _stakedPools } = stakedPoolsQuery;

  // Pool records for all the pools where a user has staked BPT.
  const stakedPools = computed(
    (): Pool[] => _stakedPools.value?.pages[0].pools || []
  );

  // Total fiat value of staked shares.
  const totalStakedValue = computed((): string => {
    return Object.keys(stakedBptMap.value || {})
      .reduce((acc, poolId) => {
        const pool = stakedPools.value.find(pool => pool.id === poolId);
        if (!pool) return acc;
        const bpt = stakedBptMap?.value?.[poolId] || '0';
        return acc + Number(fiatValueOf(pool, bpt));
      }, 0)
      .toString();
  });

  // Is loading any user staking data?
  const isLoading = computed(
    (): boolean =>
      isQueryLoading(userGaugeSharesQuery) ||
      isQueryLoading(userBoostsQuery) ||
      isQueryLoading(stakedPoolsQuery)
  );

  return {
    stakedPools,
    poolBoostsMap,
    stakedBptMap,
    totalStakedValue,
    isLoading,
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
