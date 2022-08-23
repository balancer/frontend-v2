import { flatten } from 'lodash';
import { computed, Ref, ref } from 'vue';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import { lpTokensFor } from '../usePool';
import useTokens from '../useTokens';
import { Pool } from '@/services/pool/types';
import POOLS_CACHE from '@/constants/initialPools.json';

export default function usePools(tokenList: Ref<string[]> = ref([])) {
  // COMPOSABLES
  const poolsQuery = usePoolsQuery(tokenList);
  const { injectTokens } = useTokens();

  console.log('Pools Cache: ', POOLS_CACHE);

  const pools = computed<Pool[]>(() =>
    poolsQuery.data.value
      ? flatten(poolsQuery.data.value.pages.map(page => page.pools))
      : (POOLS_CACHE as Pool[])
  );

  const tokens = computed(async () => {
    const tokenInfo = flatten(
      pools.value.map(pool => [
        ...pool.tokensList,
        ...lpTokensFor(pool),
        pool.address,
      ])
    );
    await injectTokens(tokenInfo);
    return tokenInfo;
  });

  const isLoading = computed(
    () => false //poolsQuery.isLoading.value || poolsQuery.isIdle.value
  );

  const poolsHasNextPage = computed(() => poolsQuery.hasNextPage?.value);
  const poolsIsFetchingNextPage = computed(
    () => poolsQuery.isFetchingNextPage?.value
  );

  // METHODS
  function loadMorePools() {
    poolsQuery.fetchNextPage.value();
  }

  return {
    pools,
    tokens,
    isLoading,
    poolsHasNextPage,
    poolsIsFetchingNextPage,

    // methods
    loadMorePools,
  };
}
