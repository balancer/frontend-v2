import { flatten } from 'lodash';
import { computed, Ref, ref } from 'vue';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';

export default function usePools(tokenList: Ref<string[]> = ref([])) {
  // COMPOSABLES
  const poolsQuery = usePoolsQuery(tokenList);

  const pools = computed(() =>
    poolsQuery.data.value
      ? flatten(poolsQuery.data.value.pages.map(page => page.pools))
      : []
  );

  const tokens = computed(() =>
    poolsQuery.data.value
      ? flatten(poolsQuery.data.value.pages.map(page => page.tokens))
      : []
  );

  const isLoading = computed(
    () => poolsQuery.isLoading.value || poolsQuery.isIdle.value
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
