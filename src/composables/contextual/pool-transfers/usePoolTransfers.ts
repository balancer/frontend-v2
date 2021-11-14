import { ref, computed } from 'vue';
import { FullPool } from '@/services/balancer/subgraph/types';
// Composables
import usePoolQuery from '@/composables/queries/usePoolQuery';
import { useRoute } from 'vue-router';
import useTokens from '@/composables/useTokens';
import usePools from '@/composables/pools/usePools';

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
  const { poolsWithFarms, userPools } = usePools();

  /**
   * QUERIES
   */
  const poolQuery = usePoolQuery(id.value);

  /**
   * COMPUTED
   */
  const pool = computed(() => {
    const poolWithFarm = poolsWithFarms.value.find(
      poolWithFarm => poolWithFarm.id === (route.params.id as string)
    );
    const userPool = userPools.value.find(
      poolWithFarm => poolWithFarm.id === (route.params.id as string)
    );

    if (!poolQuery.data.value) {
      return undefined;
    }

    return {
      ...poolQuery.data.value,
      dynamic: poolWithFarm
        ? poolWithFarm.dynamic
        : poolQuery.data.value.dynamic,
      hasLiquidityMiningRewards: !!poolWithFarm,
      farm: poolWithFarm?.farm,
      shares: userPool?.shares
    };
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
    missingPrices,
    transfersAllowed
  };
}
