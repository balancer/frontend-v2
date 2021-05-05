import { computed } from 'vue';

import { bnum } from '@/utils';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import usePoolSharesQuery from '@/composables/queries/usePoolSharesQuery';
import useWeb3 from '@/composables/useWeb3';

export default function usePools() {
  // COMPOSABLES
  const { isConnected } = useWeb3();
  const poolsQuery = usePoolsQuery();
  const poolSharesQuery = usePoolSharesQuery();

  // COMPUTED
  const pools = computed(() => poolsQuery.data.value?.pools);
  const tokens = computed(() => poolsQuery.data.value?.tokens);

  const poolsWithShares = computed(() => {
    if (isConnected.value && poolSharesQuery.data.value) {
      const { poolSharesMap, poolSharesIds } = poolSharesQuery.data.value;

      return poolsQuery.data.value?.pools
        .filter(pool => poolSharesIds.includes(pool.id))
        .map(pool => ({
          ...pool,
          shares: bnum(pool.totalLiquidity)
            .div(pool.totalShares)
            .times(poolSharesMap[pool.id].balance)
            .toString()
        }));
    }
    return [];
  });

  const totalInvestedAmount = computed(() =>
    poolsWithShares.value
      ?.map(pool => pool.shares)
      .reduce((totalShares, shares) => totalShares.plus(shares), bnum(0))
      .toString()
  );

  const isLoadingPools = computed(
    () => poolsQuery.isLoading.value || poolsQuery.isIdle.value
  );

  const isLoadingPoolsWithShares = computed(
    () => poolSharesQuery.isLoading.value || poolSharesQuery.isIdle.value
  );

  return {
    // computed
    pools,
    tokens,
    poolsWithShares,
    totalInvestedAmount,
    isLoadingPools,
    isLoadingPoolsWithShares
  };
}
