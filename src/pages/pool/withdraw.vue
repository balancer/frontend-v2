<script setup lang="ts">
import { oneSecondInMs } from '@/composables/useTime';
import { useIntervalFn } from '@vueuse/core';
import WithdrawPage from '@/components/contextual/pages/pool/withdraw/WithdrawPage.vue';
import { useTokens } from '@/providers/tokens.provider';
import { usePool } from '@/providers/local/pool.provider';

/**
 * COMPOSABLES
 */
const { pool, isLoadingPool, refetchOnchainPoolData } = usePool();
const { balanceQueryLoading } = useTokens();

// Instead of refetching pool data on every block, we refetch every 20s to prevent
// overfetching a request on short blocktime networks like Polygon.
useIntervalFn(refetchOnchainPoolData, oneSecondInMs * 20);

/**
 * COMPUTED
 */
const isLoading = computed(
  (): boolean => isLoadingPool.value || balanceQueryLoading.value
);
</script>

<template>
  <div class="px-4 sm:px-0 mx-auto max-w-md">
    <BalLoadingBlock v-if="isLoading || !pool" class="h-96" />
    <WithdrawPage v-else :pool="pool" />
  </div>
</template>
