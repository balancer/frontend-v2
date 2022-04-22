import { computed } from 'vue';
import useUserPoolDataQuery from '@/beethovenx/composables/queries/useUserPoolDataQuery';
import usePoolList from '@/beethovenx/composables/usePoolList';
import {
  GqlBeetsUserPoolData,
  GqlBeetsUserPoolPoolData,
  UserPoolListItem
} from '@/beethovenx/services/beethovenx/beethovenx-types';
import { MINIMUM_DUST_VALUE_USD } from '@/beethovenx/constants/dust';

export default function useUserPoolsData() {
  const userPoolDataQuery = useUserPoolDataQuery();
  const { poolList, poolListLoading } = usePoolList();

  const userPoolDataLoading = computed(
    () =>
      userPoolDataQuery.isLoading.value ||
      userPoolDataQuery.isIdle.value ||
      poolListLoading.value
  );

  const userPoolsData = computed<GqlBeetsUserPoolData>(
    () =>
      userPoolDataQuery.data.value ?? {
        totalBalanceUSD: '0',
        totalFarmBalanceUSD: '0',
        averageFarmApr: '0',
        averageApr: '0',
        pools: []
      }
  );

  const userPools = computed<GqlBeetsUserPoolPoolData[]>(
    () => userPoolsData.value.pools
  );

  const userPoolList = computed<UserPoolListItem[]>(() => {
    const userPoolIds = userPools.value.map(item => item.poolId);

    return poolList.value
      .filter(pool => userPoolIds.includes(pool.id))
      .map(pool => {
        const data = userPools.value.find(item => item.poolId === pool.id);

        return {
          ...pool,
          userBalance: data?.balanceUSD || '0',
          hasUnstakedBpt: data?.hasUnstakedBpt
        };
      })
      .filter(pool => Number(pool.userBalance) > MINIMUM_DUST_VALUE_USD);
  });

  return {
    userPoolDataLoading,
    userPoolList,
    userPoolsData
  };
}
