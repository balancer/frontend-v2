<script setup lang="ts">
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { usePool } from '@/composables/usePool';
import { oneMinInMs } from '@/composables/useTime';
import { useIntervalFn } from '@vueuse/core';
import { computed } from 'vue';
import { hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import WithdrawPage from '@/components/contextual/pages/pool/withdraw/WithdrawPage.vue';
import ProvideExitPool from '@/components/contextual/pages/pool/withdraw/ProvideExitPool.vue';
import { useTokens } from '@/providers/tokens.provider';
import usePoolTransfersGuard from '@/composables/contextual/pool-transfers/usePoolTransfersGuard';

/**
 * COMPOSABLES
 */
const { pool, poolQuery, loadingPool, transfersAllowed } = usePoolTransfers();
const { isDeepPool } = usePool(pool);
const { balanceQueryLoading } = useTokens();
usePoolTransfersGuard();

// Instead of refetching pool data on every block, we refetch every minute to prevent
// overfetching a heavy request on short blocktime networks like Polygon.
// TODO: Don't refetch whole pool, only update balances and weights with
// onchain calls. i.e. only refetch what's required to be up to date for joins/exits.
useIntervalFn(poolQuery.refetch, oneMinInMs);

/**
 * COMPUTED
 */
// We only need to wait for SOR if it's a deep pool.
const isLoadingSor = computed(
  (): boolean => isDeepPool.value && !hasFetchedPoolsForSor.value
);

const isLoading = computed(
  (): boolean =>
    loadingPool.value ||
    !transfersAllowed.value ||
    isLoadingSor.value ||
    balanceQueryLoading.value
);
</script>

<template>
  <div class="px-4 sm:px-0 mx-auto max-w-md">
    <BalLoadingBlock v-if="isLoading || !pool" class="h-96" />
    <ProvideExitPool v-else :pool="pool">
      <WithdrawPage :pool="pool"></WithdrawPage>
    </ProvideExitPool>
  </div>
</template>
