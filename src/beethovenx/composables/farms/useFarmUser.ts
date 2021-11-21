import { computed } from 'vue';
import useFarmUserQuery from '@/beethovenx/composables/farms/useFarmUserQuery';

export default function useFarmUser(farmId: string) {
  const farmUserQuery = useFarmUserQuery(farmId);

  const farmUser = computed(() => {
    return farmUserQuery.data.value;
  });

  const farmUserLoading = computed(() => {
    return farmUserQuery.isLoading.value || farmUserQuery.isIdle.value;
  });

  return {
    farmUser,
    farmUserLoading,
    farmUserRefetch: farmUserQuery.refetch
  };
}
