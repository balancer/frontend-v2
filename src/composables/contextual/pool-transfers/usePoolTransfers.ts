import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

// Composables
import usePoolQuery from '@/composables/queries/usePoolQuery';
import {
  isDeep,
  noInitLiquidity,
  tokensListExclBpt,
} from '@/composables/usePool';
import { useTokens } from '@/providers/tokens.provider';
import { includesAddress } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import usePoolDecorationQuery from '@/composables/queries/usePoolDecorationQuery';
import { useHasBlockedJoins } from '@/composables/useHasBlockedJoins';

/**
 * STATE
 */
const useNativeAsset = ref(false);

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
  const initialPool = computed((): Pool | undefined => {
    return poolQuery.data.value;
  });

  const poolDecorationQuery = usePoolDecorationQuery(initialPool);

  const poolQueryLoading = computed((): boolean => isQueryLoading(poolQuery));

  const loadingPool = computed(
    (): boolean => poolQueryLoading.value || !initialPool.value
  );

  const pool = computed((): Pool | undefined => {
    return poolDecorationQuery.data.value || initialPool.value;
  });

  const tokenAddresses = computed(() => {
    if (initialPool.value) {
      if (isDeep(initialPool.value)) {
        return initialPool.value.mainTokens || [];
      }
      return tokensListExclBpt(initialPool.value);
    }
    return [];
  });

  const missingPrices = computed(() => {
    const tokensWithPrice = Object.keys(prices.value).map(t => t.toLowerCase());
    return !tokenAddresses.value.every(token =>
      includesAddress(tokensWithPrice, token)
    );
  });

  const shouldBeRedirected = computed(
    () => pool.value && noInitLiquidity(pool.value)
  );

  const transfersAllowed = computed(() => {
    if (!pool.value) return false;
    const { hasBlockedJoins } = useHasBlockedJoins(pool.value);
    return !hasBlockedJoins.value || !shouldBeRedirected.value;
  });

  return {
    pool,
    poolQuery,
    poolDecorationQuery,
    loadingPool,
    useNativeAsset,
    missingPrices,
    transfersAllowed,
    shouldBeRedirected,
  };
}
