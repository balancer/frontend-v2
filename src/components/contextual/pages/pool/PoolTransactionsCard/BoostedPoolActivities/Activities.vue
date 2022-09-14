<script setup lang="ts">
import { flatten } from 'lodash';
import { computed } from 'vue';

import usePoolSwapsQuery from '@/composables/queries/usePoolSwapsQuery';
import useUserPoolSwapsQuery from '@/composables/queries/useUserPoolSwapsQuery';
import { Pool } from '@/services/pool/types';

import { PoolTransactionsTab } from '../types';
import Table from './Table.vue';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  loading: boolean;
  poolActivityType: PoolTransactionsTab;
};

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {
  loading: false,
  poolActivityType: PoolTransactionsTab.ALL_ACTIVITY,
});

/**
 * QUERIES
 */

const poolSwapsQuery =
  props.poolActivityType === PoolTransactionsTab.ALL_ACTIVITY
    ? usePoolSwapsQuery(props.pool.id)
    : useUserPoolSwapsQuery(props.pool.id);

/**
 * COMPUTED
 */
const poolSwaps = computed(() =>
  poolSwapsQuery.data.value
    ? flatten(poolSwapsQuery.data.value.pages.map(page => page.poolSwaps))
    : []
);
const isLoadingPoolSwaps = computed(() => poolSwapsQuery.isLoading.value);
const poolSwapsHasNextPage = computed(() => poolSwapsQuery.hasNextPage?.value);
const poolSwapsIsFetchingNextPage = computed(
  () => poolSwapsQuery.isFetchingNextPage?.value
);

/**
 * METHODS
 */
function loadMorePoolSwaps() {
  poolSwapsQuery.fetchNextPage.value();
}
</script>

<template>
  <Table
    :tokens="pool ? pool.tokensList : []"
    :poolSwaps="poolSwaps"
    :pool="pool"
    :isLoading="loading || isLoadingPoolSwaps"
    :isLoadingMore="poolSwapsIsFetchingNextPage"
    :isPaginated="poolSwapsHasNextPage"
    :noResultsLabel="
      poolActivityType === PoolTransactionsTab.ALL_ACTIVITY
        ? $t('poolTransactions.noResults.allTransactions')
        : $t('poolTransactions.noResults.myTransactions')
    "
    @load-more="loadMorePoolSwaps"
  />
</template>
