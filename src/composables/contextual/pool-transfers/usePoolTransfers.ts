import { ref, computed } from 'vue';
import { FullPool } from '@/services/balancer/subgraph/types';
// Composables
import usePoolQuery from '@/composables/queries/usePoolQuery';
import { useRoute } from 'vue-router';
import useTokens from '@/composables/useTokens';

/**
 * STATE
 */
const useNativeAsset = ref(false);

export default function usePoolTransfers() {
  const route = useRoute();
  const id = ref<string>(route.params.id as string);

  /**
   * COMPOSABLES
   */
  const { prices } = useTokens();

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

  const poolQueryLoading = computed(
    (): boolean =>
      (poolQuery.isLoading.value as boolean) ||
      (poolQuery.isIdle.value as boolean) ||
      (poolQuery.error.value as boolean)
  );

  const loadingPool = computed(
    (): boolean => poolQueryLoading.value || !pool.value
  );

  const missingPrices = computed(() => {
    if (pool.value) {
      const tokensWithPrice = Object.keys(prices.value);
      return !pool.value.tokenAddresses.every(token =>
        tokensWithPrice.includes(token)
      );
    }
    return false;
  });

  return {
    pool,
    loadingPool,
    useNativeAsset,
    missingPrices
  };
}
