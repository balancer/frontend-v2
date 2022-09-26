import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

// Composables
import usePoolQuery from '@/composables/queries/usePoolQuery';
import { isDeep } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { includesAddress } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

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
  const { blockNumber } = useWeb3();

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
      if (isDeep(pool.value)) {
        return pool.value.mainTokens || [];
      }
      return pool.value?.tokensList || [];
    }
    return [];
  });

  const missingPrices = computed(() => {
    const tokensWithPrice = Object.keys(prices.value).map(t => t.toLowerCase());
    return !tokenAddresses.value.every(token =>
      includesAddress(tokensWithPrice, token)
    );
  });

  /**
   * WATCHERS
   */
  watch(blockNumber, async () => {
    poolQuery.refetch.value();
  });

  return {
    pool,
    loadingPool,
    useNativeAsset,
    missingPrices,
    transfersAllowed,
  };
}
