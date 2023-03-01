<script setup lang="ts">
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import InvestPage from '@/components/contextual/pages/pool/invest/InvestPage.vue';
import { useIntervalFn } from '@vueuse/core';
import { oneSecondInMs } from '@/composables/useTime';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
import { useRoute } from 'vue-router';
import usePoolTransfersGuard from '@/composables/contextual/pool-transfers/usePoolTransfersGuard';
import { hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import { usePool } from '@/composables/usePool';

/**
 * STATE
 */
const route = useRoute();
const poolId = (route.params.id as string).toLowerCase();

/**
 * PROVIDERS
 */
providePoolStaking(poolId);
usePoolTransfersGuard();

/**
 * COMPOSABLES
 */
const { pool, poolDecorationQuery, loadingPool, transfersAllowed } =
  usePoolTransfers();
const { isDeepPool } = usePool(pool);

/**
 * COMPUTED
 */
// We only need to wait for SOR if it's a deep pool.
const isLoadingSor = computed(
  (): boolean => isDeepPool.value && !hasFetchedPoolsForSor.value
);

const isLoading = computed(
  (): boolean =>
    loadingPool.value && !transfersAllowed.value && isLoadingSor.value
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

