import { computed, Ref } from 'vue';
import { GqlBeetsUserPoolPoolData } from '@/beethovenx/services/beethovenx/beethovenx-types';
import useUserPoolsData from '@/beethovenx/composables/useUserPoolsData';

export default function useUserPoolData(poolId: Ref<string>) {
  const { userPoolsData, userPoolDataLoading } = useUserPoolsData();

  const isLoadingUserPoolData = computed(() => userPoolDataLoading.value);

  const userPoolData = computed<GqlBeetsUserPoolPoolData | null>(() => {
    return (
      userPoolsData.value.pools.find(pool => pool.poolId === poolId.value) ||
      null
    );
  });

  return {
    isLoadingUserPoolData,
    userPoolData
  };
}
