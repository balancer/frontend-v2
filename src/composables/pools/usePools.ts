import { flatten } from 'lodash';
import { computed, Ref, ref, watch } from 'vue';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import useTokens from '../useTokens';
import { Pool } from '@/services/pool/types';
import { extractTokenAddresses } from '../usePool';

export default function usePools(filterTokens: Ref<string[]> = ref([])) {
  /**
   * COMPOSABLES
   */
  const poolsQuery = usePoolsQuery(filterTokens);
  const { injectTokens } = useTokens();

  /**
   * COMPUTED
   */
  const pools = computed<Pool[]>(() => {
    const paginatedPools = poolsQuery.data.value;
    return paginatedPools
      ? flatten(paginatedPools.pages.map(page => page.pools))
      : [];
  });

  const isLoading = computed(
    () => poolsQuery.isLoading.value || poolsQuery.isIdle.value
  );

  const poolsHasNextPage = computed(() => poolsQuery.hasNextPage?.value);
  const poolsIsFetchingNextPage = computed(
    () => poolsQuery.isFetchingNextPage?.value
  );

  /**
   * METHODS
   */
  function loadMorePools() {
    poolsQuery.fetchNextPage.value();
  }

  /**
   * WATCHERS
   */
  watch(pools, async newPools => {
    const tokenAddresses = flatten(newPools.map(extractTokenAddresses));
    await injectTokens(tokenAddresses);
  });

  return {
    pools,
    isLoading,
    poolsHasNextPage,
    poolsIsFetchingNextPage,
    // methods
    loadMorePools,
  };
}
