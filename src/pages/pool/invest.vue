<script setup lang="ts">
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { JoinPoolProvider } from '@/providers/local/join-pool.provider';
import InvestPage from '@/components/contextual/pages/pool/invest/InvestPage.vue';
import useInvestPageTabs, { Tab } from '@/composables/pools/useInvestPageTabs';
import { usePool } from '@/composables/usePool';
import { useIntervalFn } from '@vueuse/core';
import { oneMinInMs } from '@/composables/useTime';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
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
const { pool, poolQuery } = usePoolTransfers();
const { isDeepPool } = usePool(pool);
const { activeTab } = useInvestPageTabs();

// Instead of refetching pool data on every block, we refetch every minute to prevent
// overfetching a heavy request on short blocktime networks like Polygon.
// TODO: Don't refetch whole pool, only update balances and weights with
// onchain calls. i.e. only refetch what's required to be up to date for joins/exits.
useIntervalFn(poolQuery.refetch.value, oneMinInMs);
</script>

<template>
  <JoinPoolProvider
    v-if="pool && isDeepPool"
    :pool="pool"
    :isSingleAssetJoin="activeTab === Tab.SingleToken"
  >
    <InvestPage></InvestPage>
  </JoinPoolProvider>
  <InvestPage v-else></InvestPage>
</template>

