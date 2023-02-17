<script setup lang="ts">
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import InvestPage from '@/components/contextual/pages/pool/invest/InvestPage.vue';
import { useIntervalFn } from '@vueuse/core';
import { oneMinInMs } from '@/composables/useTime';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
import { useRoute } from 'vue-router';
import usePoolTransfersGuard from '@/composables/contextual/pool-transfers/usePoolTransfersGuard';

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
const { pool, poolQuery } = usePoolTransfers();

// Instead of refetching pool data on every block, we refetch every minute to prevent
// overfetching a heavy request on short blocktime networks like Polygon.
// TODO: Don't refetch whole pool, only update balances and weights with
// onchain calls. i.e. only refetch what's required to be up to date for joins/exits.
useIntervalFn(poolQuery.refetch, oneMinInMs);
</script>

<template>
  <!-- TODO: handle loading state -->
  <InvestPage v-if="pool" :pool="pool"></InvestPage>
</template>

