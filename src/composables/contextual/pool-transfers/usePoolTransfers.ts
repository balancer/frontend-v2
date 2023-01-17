import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

// Composables
import usePoolQuery from '@/composables/queries/usePoolQuery';
import { isDeep, tokensListExclBpt } from '@/composables/usePool';
import { useTokens } from '@/providers/tokens.provider';
import { includesAddress } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';

/**
 * STATE
 */
const useNativeAsset = ref(false);
const transfersAllowed = ref(true);

export default function usePoolTransfers() {
  const route = useRoute();
  const id = (route.params.id as string).toLowerCase();

  /**
   * COMPOSABLES
   */
  const { prices } = useTokens();

  /**
   * QUERIES
   */
  const poolQuery = usePoolQuery(id);

  /**
   * COMPUTED
   */
  const pool = computed((): Pool | undefined => {
    return poolQuery.data.value;
  });

  const poolQueryLoading = computed((): boolean => isQueryLoading(poolQuery));

  const loadingPool = computed(
    (): boolean => poolQueryLoading.value || !pool.value
  );

  const tokenAddresses = computed(() => {
    if (pool.value) {
      if (isDeep(pool.value)) {
        return pool.value.mainTokens || [];
      }
      return tokensListExclBpt(pool.value);
    }
    return [];
  });

  const missingPrices = computed(() => {
    const tokensWithPrice = Object.keys(prices.value).map(t => t.toLowerCase());
    return !tokenAddresses.value.every(token =>
      includesAddress(tokensWithPrice, token)
    );
  });

  return {
    pool,
    poolQuery,
    loadingPool,
    useNativeAsset,
    missingPrices,
    transfersAllowed,
  };
}
