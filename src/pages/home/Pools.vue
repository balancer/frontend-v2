<script setup lang="ts">
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import usePools from '@/composables/pools/usePools';

// COMPOSABLES
const { selectedTokens } = usePoolFilters();

const poolsSortField = ref('totalLiquidity');

const { pools, isLoading, poolsIsFetchingNextPage, loadMorePools } = usePools(
  selectedTokens,
  poolsSortField
);
const isPaginated = computed(() => pools.value.length >= 10);

/**
 * METHODS
 */

function onColumnSort(columnId: string) {
  poolsSortField.value = columnId;
}
</script>

<template>
  <PoolsTable
    :data="pools"
    :noPoolsLabel="$t('noPoolsFound')"
    :isLoading="isLoading"
    :selectedTokens="selectedTokens"
    :hiddenColumns="['migrate', 'actions', 'lockEndDate']"
    :isLoadingMore="poolsIsFetchingNextPage"
    :isPaginated="isPaginated"
    skeletonClass="h-40"
    @on-column-sort="onColumnSort"
    @load-more="loadMorePools"
  />
</template>