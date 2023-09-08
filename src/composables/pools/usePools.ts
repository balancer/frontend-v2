import { flatten } from 'lodash';
import { computed, Ref, ref, watch } from 'vue';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import { useTokens } from '@/providers/tokens.provider';
import { Pool, PoolType } from '@/services/pool/types';
import { tokenTreeLeafs } from '../usePoolHelpers';
import { PoolAttributeFilter, PoolFilterOptions } from '@/types/pools';

type Props = {
  filterTokens?: Ref<string[]>;
  sortField?: Ref<string>;
  poolIds?: Ref<string[]>;
  poolTypes?: Ref<PoolType[]>;
  poolAttributes?: Ref<PoolAttributeFilter[]>;
};

export default function usePools({
  filterTokens = ref([]),
  sortField = ref('totalLiquidity'),
  poolIds = ref([]),
  poolTypes = ref([]),
  poolAttributes = ref([]),
}: Props) {
  const filterOptions: PoolFilterOptions = computed(() => ({
    tokens: filterTokens.value,
    sortField: sortField.value,
    poolIds: poolIds.value,
    poolTypes: poolTypes.value,
    poolAttributes: poolAttributes.value,
  }));

  /**
   * COMPOSABLES
   */
  const poolsQuery = usePoolsQuery(
    filterOptions,
    { enabled: true, refetchOnWindowFocus: false, keepPreviousData: true },
    false
  );

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

  const hasNextPage = computed(() => poolsQuery.hasNextPage?.value);
  const isFetchingNextPage = computed(
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
  watch(pools, newPools => {
    const tokens = flatten(
      newPools.map(pool => [
        ...pool.tokensList,
        ...tokenTreeLeafs(pool.tokens),
        pool.address,
      ])
    );
    injectTokens(tokens);
  });

  return {
    pools,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    // methods
    loadMorePools,
  };
}
