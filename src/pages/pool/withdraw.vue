<script setup lang="ts">
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { usePool } from '@/composables/usePoolHelpers.js';
import { oneSecondInMs } from '@/composables/useTime';
import { useIntervalFn } from '@vueuse/core';
import { computed } from 'vue';
import { hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import WithdrawPage from '@/components/contextual/pages/pool/withdraw/WithdrawPage.vue';
import { useTokens } from '@/providers/tokens.provider';

/**
 * COMPOSABLES
 */
const { pool, poolDecorationQuery, loadingPool } = usePoolTransfers();
const { isDeepPool } = usePool(pool);
const { balanceQueryLoading } = useTokens();

// Instead of refetching pool data on every block, we refetch every 20s to prevent
// overfetching a request on short blocktime networks like Polygon.
useIntervalFn(poolDecorationQuery.refetch, oneSecondInMs * 20);

/**
 * COMPUTED
 */
// We only need to wait for SOR if it's a deep pool.
const isLoadingSor = computed(
  (): boolean => isDeepPool.value && !hasFetchedPoolsForSor.value
);

const isLoading = computed(
  (): boolean =>
    loadingPool.value || isLoadingSor.value || balanceQueryLoading.value
);
</script>

<template>
  <div class="px-4 sm:px-0 mx-auto max-w-md">
    <BalLoadingBlock v-if="isLoading || !pool" class="h-96" />
    <WithdrawPage v-else :pool="pool"></WithdrawPage>
  </div>
</template>
