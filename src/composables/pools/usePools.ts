import { computed, Ref, ref } from 'vue';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';

export default function usePools(tokenList: Ref<string[]> = ref([])) {
  // COMPOSABLES
  const poolsQuery = usePoolsQuery(tokenList);

  const pools = computed(() => poolsQuery.data.value || []);

  const isLoading = computed(
    () => poolsQuery.isLoading.value || poolsQuery.isIdle.value
  );

  return {
    pools,
    isLoading,
  };
}
