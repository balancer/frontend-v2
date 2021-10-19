import { ref, computed } from 'vue';
import { FullPool } from '@/services/balancer/subgraph/types';
// Composables
import usePoolQuery from '@/composables/queries/usePoolQuery';
import { useRoute } from 'vue-router';

/**
 * STATE
 */
const useNativeAsset = ref(false);

export default function usePoolTransfers() {
  const route = useRoute();
  const id = ref<string>(route.params.id as string);

  /**
   * QUERIES
   */
  const poolQuery = usePoolQuery(id.value);

  /**
   * COMPUTED
   */
  const pool = computed((): FullPool | undefined => {
    return poolQuery.data.value;
  });

  const loadingPool = computed(
    (): boolean =>
      (poolQuery.isLoading.value as boolean) ||
      (poolQuery.isIdle.value as boolean) ||
      (poolQuery.error.value as boolean)
  );

  const poolLoaded = computed(
    (): boolean => !loadingPool.value && !!pool.value
  );

  return {
    pool,
    poolLoaded,
    useNativeAsset
  };
}
