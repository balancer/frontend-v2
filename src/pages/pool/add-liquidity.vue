<script setup lang="ts">
import InvestPage from '@/components/contextual/pages/pool/invest/InvestPage.vue';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { usePoolHelper } from '@/composables/usePoolHelpers';
import { oneSecondInMs } from '@/composables/useTime';
import { hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
import { useIntervalFn } from '@vueuse/core';
import { useRoute } from 'vue-router';

/**
 * STATE
 */
const route = useRoute();
const poolId = (route.params.id as string).toLowerCase();

/**
 * PROVIDERS
 */
providePoolStaking(poolId);

/**
 * COMPOSABLES
 */
const { pool, poolDecorationQuery, loadingPool } = usePoolTransfers();
const { isDeepPool } = usePoolHelper(pool);

/**
 * COMPUTED
 */
// We only need to wait for SOR if it's a deep pool.
const isLoadingSor = computed(
  (): boolean => isDeepPool.value && !hasFetchedPoolsForSor.value
);

const isLoading = computed(
  (): boolean => loadingPool.value || isLoadingSor.value
);

// Instead of refetching pool data on every block, we refetch every 20s to prevent
// overfetching a request on short blocktime networks like Polygon.
useIntervalFn(poolDecorationQuery.refetch, oneSecondInMs * 20);
</script>

<template>
  <div class="px-4 lg:px-0 mx-auto max-w-3xl">
    <BalLoadingBlock v-if="isLoading || !pool" class="h-96" />
    <InvestPage v-else :pool="pool" />
  </div>
</template>

