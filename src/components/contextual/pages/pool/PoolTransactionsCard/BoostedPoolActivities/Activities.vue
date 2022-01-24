<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { flatten } from 'lodash';

import usePoolSwapsQuery from '@/composables/queries/usePoolSwapsQuery';
import useUserPoolSwapsQuery from '@/composables/queries/useUserPoolSwapsQuery';

import { FullPool } from '@/services/balancer/subgraph/types';

import { PoolTransactionsTab } from '../types';

import Table from './Table.vue';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  loading: boolean;
  poolActivityType: PoolTransactionsTab;
};

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {
  loading: false,
  poolActivityType: PoolTransactionsTab.ALL_ACTIVITY
});

/**
 * COMPOSABLES
 */
const route = useRoute();

/**
 * STATE
 */

const id = route.params.id as string;
/**
 * QUERIES
 */

const poolSwapsQuery =
  props.poolActivityType === PoolTransactionsTab.ALL_ACTIVITY
    ? usePoolSwapsQuery(id)
    : useUserPoolSwapsQuery(id);

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
    :pool-swaps="poolSwaps"
    :pool="pool"
    :is-loading="loading || isLoadingPoolSwaps"
    :is-loading-more="poolSwapsIsFetchingNextPage"
    :is-paginated="poolSwapsHasNextPage"
    @load-more="loadMorePoolSwaps"
    :no-results-label="
      poolActivityType === PoolTransactionsTab.ALL_ACTIVITY
        ? $t('poolTransactions.noResults.allTransactions')
        : $t('poolTransactions.noResults.myTransactions')
    "
  />
</template>
