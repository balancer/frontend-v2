/**
 * Provides all user staking related data.
 */
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import symbolKeys from '@/constants/symbol.keys';
import { Pool } from '@/services/pool/types';
import { computed, inject, InjectionKey, provide, reactive, ref } from 'vue';
import { useUserData } from '../user-data.provider';

const provider = () => {
  /**
   * COMPOSABLES
   */
  const { userGaugeSharesQuery, userBoostsQuery } = useUserData();
  const { data: userGaugeShares } = userGaugeSharesQuery;
  const { data: poolBoostsMap } = userBoostsQuery;

  /**
   * COMPUTED
   */
  const stakedPoolIds = computed((): string[] => {
    if (!userGaugeShares.value) return [];

    return userGaugeShares.value.map(gaugeShare => gaugeShare.gauge.poolId);
  });

  const isPoolsQueryEnabled = computed(
    (): boolean => stakedPoolIds.value.length > 0
  );
  const { data: _stakedPools } = usePoolsQuery(
    ref([]),
    reactive({
      enabled: isPoolsQueryEnabled,
    }),
    {
      poolIds: stakedPoolIds,
      pageSize: 999,
    }
  );

  const stakedPools = computed(
    (): Pool[] => _stakedPools.value?.pages[0].pools || []
  );

  return {
    stakedPools,
    poolBoostsMap,
  };
};

/**
 * Provide setup: response type + symbol.
 */
export type Response = ReturnType<typeof provider>;
export const UserStakingProviderSymbol: InjectionKey<Response> = Symbol(
  symbolKeys.Providers.UserStaking
);

export function provideUserStaking() {
  provide(UserStakingProviderSymbol, provider());
}

export function useUserStaking(): Response {
  const defaultResponse = {} as Response;
  return inject(UserStakingProviderSymbol, defaultResponse);
}
