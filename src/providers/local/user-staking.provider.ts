/**
 * Provides all user staking related data.
 */
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import { fiatValueOf } from '@/composables/usePoolHelpers';
import symbolKeys from '@/constants/symbol.keys';
import { Pool } from '@/services/pool/types';
import { computed, InjectionKey, provide, reactive, ref } from 'vue';
import { safeInject } from '../inject';
import { useUserData } from '../user-data.provider';
import usePoolsGaugesQuery from '@/composables/queries/usePoolsGaugesQuery';
import { bnum, isSameAddress } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { GaugeCheckpointer } from '@/services/balancer/contracts/contracts/gauge-checkpointer';

const provider = () => {
  /**
   * COMPOSABLES
   */
  const { userGaugeSharesQuery, userBoostsQuery, stakedSharesQuery } =
    useUserData();
  const { getSigner } = useWeb3();
  /**
   * COMPUTED
   */
  const { data: userGaugeShares } = userGaugeSharesQuery;
  const { data: poolBoostsMap } = userBoostsQuery;
  const { data: stakedShares } = stakedSharesQuery;

  // Array of all the pools a user has staked BPT for.
  const stakedPoolIds = computed((): string[] => {
    if (!userGaugeShares.value) return [];
    console.log('userGaugeShares.value', userGaugeShares.value);
    return userGaugeShares.value.map(gaugeShare => gaugeShare.gauge.poolId);
  });

  // Array of all the pools addresses a user has staked BPT for.
  const stakedPoolAddresses = computed((): string[] => {
    if (!userGaugeShares.value) return [];

    return userGaugeShares.value.map(
      gaugeShare => gaugeShare.gauge.poolAddress
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

  const { data: poolsGauges, isLoading: isLoadingPoolsGauges } =
    usePoolsGaugesQuery(computed(() => stakedPoolAddresses.value));

  // Map of user gauge addresses -> balance.
  const userGaugeSharesMap = computed((): Record<string, string> => {
    if (!userGaugeShares.value) return {};

    return userGaugeShares.value.reduce((acc, share) => {
      acc[share.gauge.id] = share.balance;
      return acc;
    }, {} as Record<string, string>);
  });

  const hasNonPrefGaugesPoolsIds = computed(() => {
    return poolsGauges.value?.pools.reduce((acc: string[], pool) => {
      const preferentialGaugeAddress = pool.preferentialGauge?.id || '';
      const hasNonPregGauge = pool.gauges.some(
        gaugeAddress =>
          !isSameAddress(gaugeAddress.id, preferentialGaugeAddress) &&
          bnum(userGaugeSharesMap.value[gaugeAddress.id] || '0').gt(0)
      );

      if (hasNonPregGauge) {
        acc.push(pool.address);
      }
      return acc;
    }, []);
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
      isQueryLoading(stakedPoolsQuery) ||
      isLoadingPoolsGauges.value
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

  async function checkpointAllGauges(poolIds: string[]) {
    const contractAddress = configService.network.addresses.gaugeCheckpointer;
    if (!contractAddress) throw new Error('No contract address found');
    const signer = getSigner();
    const gaugeCheckpointerContract = new GaugeCheckpointer(contractAddress);

    const tx = await gaugeCheckpointerContract.checkpoint({ poolIds, signer });

    return tx;
  }

  return {
    stakedPools,
    stakedShares,
    poolBoostsMap,
    totalStakedValue,
    isLoading,
    refetchStakedPools,
    stakedSharesFor,
    hasNonPrefGaugesPoolsIds,
    poolsGauges,
    checkpointAllGauges,
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
