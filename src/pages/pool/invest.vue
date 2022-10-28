<script setup lang="ts">
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';

import { JoinPoolProvider } from '@/providers/local/join-pool.provider';
import InvestPage from '@/components/contextual/pages/pool/invest/InvestPage.vue';
import useInvestPageTabs, { Tab } from '@/composables/pools/useInvestPageTabs';
import { usePool } from '@/composables/usePool';
import usePoolTransfersGuard from '@/composables/contextual/pool-transfers/usePoolTransfersGuard';

usePoolTransfersGuard();
const { pool } = usePoolTransfers();
const { isDeepPool } = usePool(pool);

const { activeTab } = useInvestPageTabs();
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

