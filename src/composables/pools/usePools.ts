import { computed } from 'vue';
import useUserPoolsQuery from '@/composables/queries/useUserPoolsQuery';

export default function usePools() {
  // COMPOSABLES
  const userPoolsQuery = useUserPoolsQuery();

  const userPools = computed(() => userPoolsQuery.data.value?.pools || []);

  const totalInvestedAmount = computed(
    () => userPoolsQuery.data.value?.totalInvestedAmount
  );

  const isLoadingUserPools = computed(
    () => userPoolsQuery.isLoading.value || userPoolsQuery.isIdle.value
  );

  return {
    userPools,
    totalInvestedAmount,
    isLoadingUserPools,
  };
}
