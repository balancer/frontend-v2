import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

// Composables
import usePoolQuery from '@/composables/queries/usePoolQuery';
import { isStablePhantom } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { FullPool } from '@/services/balancer/subgraph/types';

/**
 * STATE
 */
const useNativeAsset = ref(false);
const transfersAllowed = ref(true);

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

  const tokenAddresses = computed(() => {
    if (pool.value) {
      if (isStablePhantom(pool.value.poolType)) {
        return pool.value.mainTokens || [];
      }
      return pool.value?.tokenAddresses || [];
    }
    return [];
  });

  const missingPrices = computed(() => {
    const tokensWithPrice = Object.keys(prices.value);
    return !tokenAddresses.value.every(token =>
      tokensWithPrice.includes(token)
    );
  });

  return {
    pool,
    loadingPool,
    useNativeAsset,
    missingPrices,
    transfersAllowed
  };
}
