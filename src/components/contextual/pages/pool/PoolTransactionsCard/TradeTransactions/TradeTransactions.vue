<script setup lang="ts">
import { flatten } from 'lodash';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import usePoolSwapsQuery from '@/composables/queries/usePoolSwapsQuery';
import { Pool } from '@/services/pool/types';

import Table from './Table.vue';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  loading: boolean;
};

/**
 * PROPS
 */
withDefaults(defineProps<Props>(), {
  loading: false
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
const poolSwapsQuery = usePoolSwapsQuery(id);

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
  <h4 v-text="$t('poolTransactions.tabs.trades')" class="px-4 lg:px-0 mb-5" />

  <Table
    :tokens="pool ? pool.tokensList : []"
    :pool-swaps="poolSwaps"
    :is-loading="loading || isLoadingPoolSwaps"
    :is-loading-more="poolSwapsIsFetchingNextPage"
    :is-paginated="poolSwapsHasNextPage"
    @load-more="loadMorePoolSwaps"
    :no-results-label="$t('poolTransactions.noResults.swaps')"
  />
</template>
