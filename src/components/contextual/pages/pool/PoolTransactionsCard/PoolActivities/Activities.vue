<script setup lang="ts">
import { flatten } from 'lodash';
import { computed } from 'vue';

import usePoolActivitiesQuery from '@/composables/queries/usePoolActivitiesQuery';
import usePoolUserActivitiesQuery from '@/composables/queries/usePoolUserActivitiesQuery';
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

const poolActivitiesQuery =
  props.poolActivityType === PoolTransactionsTab.ALL_ACTIVITY
    ? usePoolActivitiesQuery(props.pool.id)
    : usePoolUserActivitiesQuery(props.pool.id);

/**
 * COMPUTED
 */
const poolActivities = computed(() =>
  poolActivitiesQuery.data.value
    ? flatten(
        poolActivitiesQuery.data.value.pages.map(page => page.poolActivities)
      )
    : []
);
const isLoadingPoolActivities = computed(
  () => poolActivitiesQuery.isLoading.value
);
const poolActivitiesHasNextPage = computed(
  () => poolActivitiesQuery.hasNextPage?.value
);
const poolActivitiesIsFetchingNextPage = computed(
  () => poolActivitiesQuery.isFetchingNextPage?.value
);

/**
 * METHODS
 */
function loadMorePoolActivities() {
  poolActivitiesQuery.fetchNextPage.value();
}
</script>

<template>
  <Table
    :tokens="pool ? pool.tokensList : []"
    :poolActivities="poolActivities"
    :isLoading="loading || isLoadingPoolActivities"
    :isLoadingMore="poolActivitiesIsFetchingNextPage"
    :isPaginated="poolActivitiesHasNextPage"
    :noResultsLabel="
      poolActivityType === PoolTransactionsTab.ALL_ACTIVITY
        ? $t('poolTransactions.noResults.allInvestments')
        : $t('poolTransactions.noResults.myInvestments')
    "
    @load-more="loadMorePoolActivities"
  />
</template>
