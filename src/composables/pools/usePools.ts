import { computed, ref, watch } from 'vue';

import { bnum } from '@/utils';

import { flatten } from 'lodash';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import usePoolSharesQuery from '@/composables/queries/usePoolSharesQuery';
import useWeb3 from '@/composables/useWeb3';

export default function usePools() {
  // DATA
  const currentCount = ref(0);

  // COMPOSABLES
  const { isConnected } = useWeb3();
  const poolsQuery = usePoolsQuery();
  const poolSharesQuery = usePoolSharesQuery();

  // COMPUTED
  const pools = computed(() => {
    if (!poolsQuery.data.value) return [];
    return flatten(poolsQuery.data.value.pages.map((page: any) => page.pools));
  });
  const tokens = computed(() => {
    return [];
  });

  // watch(pools, newVal => {
  //   console.log(newVal);
  // });

  const poolsWithShares = computed(() => {
    // if (isConnected.value && poolSharesQuery.data.value) {
    //   const { poolSharesMap, poolSharesIds } = poolSharesQuery.data.value;

    //   return pools.value
    //     .filter(pool => poolSharesIds.includes(pool.id))
    //     .map(pool => ({
    //       ...pool,
    //       shares: bnum(pool.totalLiquidity)
    //         .div(pool.totalShares)
    //         .times(poolSharesMap[pool.id].balance)
    //         .toString()
    //     }));
    // }
    return [];
  });

  const totalInvestedAmount = computed(
    () => '0'
    // poolsWithShares.value
    //   ?.map(pool => pool.shares)
    //   .reduce((totalShares, shares) => totalShares.plus(shares), bnum(0))
    //   .toString()
  );

  const isLoadingPools = computed(
    () => poolsQuery.isLoading.value || poolsQuery.isIdle.value
  );

  const isLoadingPoolsWithShares = computed(
    () => false //poolSharesQuery.isLoading.value || poolSharesQuery.isIdle.value
  );

  function loadMorePools() {
    poolsQuery.fetchNextPage.value();
  }

  const hasNextPage = computed(() => poolsQuery.hasNextPage?.value);

  return {
    // computed
    pools,
    tokens,
    poolsWithShares,
    totalInvestedAmount,
    isLoadingPools,
    isLoadingPoolsWithShares,
    loadMorePools,
    hasNextPage
  };
}
