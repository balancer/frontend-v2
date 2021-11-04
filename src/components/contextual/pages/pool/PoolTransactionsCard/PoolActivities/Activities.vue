<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { flatten } from 'lodash';

import usePoolActivitiesQuery from '@/composables/queries/usePoolActivitiesQuery';
import usePoolUserActivitiesQuery from '@/composables/queries/usePoolUserActivitiesQuery';

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

const poolActivitiesQuery =
  props.poolActivityType === PoolTransactionsTab.ALL_ACTIVITY
    ? usePoolActivitiesQuery(id)
    : usePoolUserActivitiesQuery(id);

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
    :pool-activities="poolActivities"
    :is-loading="loading || isLoadingPoolActivities"
    :is-loading-more="poolActivitiesIsFetchingNextPage"
    :is-paginated="poolActivitiesHasNextPage"
    @load-more="loadMorePoolActivities"
    :no-results-label="
      poolActivityType === PoolTransactionsTab.ALL_ACTIVITY
        ? $t('poolTransactions.noResults.allInvestments')
        : $t('poolTransactions.noResults.myInvestments')
    "
  />
</template>
