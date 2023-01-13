import { flatten } from 'lodash';
import { computed, Ref, ref, watch } from 'vue';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import { useTokens } from '@/providers/tokens.provider';
import { Pool } from '@/services/pool/types';
import { tokenTreeLeafs } from '../usePool';

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

  const isLoading = computed(() => isQueryLoading(poolsQuery));

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
    const tokens = flatten(
      newPools.map(pool => [
        ...pool.tokensList,
        ...tokenTreeLeafs(pool.tokens),
        pool.address,
      ])
    );
    await injectTokens(tokens);
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
