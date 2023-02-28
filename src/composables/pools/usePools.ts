import { flatten } from 'lodash';

// import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import { useTokens } from '@/providers/tokens.provider';
// import { Pool } from '@/services/pool/types';
//Importing usePool has side-effects: fetching SOR --> try to make it more explicit
// import { tokenTreeLeafs } from '../usePool';

export default function usePools(
  filterTokens: Ref<string[]> = ref([]),
  poolsSortField: Ref<string>
) {
  /**
   * COMPOSABLES
   */
  // const poolsQuery = usePoolsQuery(
  //   filterTokens,
  //   undefined,
  //   undefined,
  //   poolsSortField
  // );

  const poolsQuery = { isLoading: ref(true), data: ref(null) };

  // const { injectTokens } = useTokens();

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
    poolsQuery.fetchNextPage();
  }

  /**
   * WATCHERS
   */
  watch(pools, async newPools => {
    const tokens = flatten(
      newPools.map(pool => [
        ...pool.tokensList,
        // ...tokenTreeLeafs(pool.tokens),
        pool.address,
      ])
    );
    // await injectTokens(tokens);
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
