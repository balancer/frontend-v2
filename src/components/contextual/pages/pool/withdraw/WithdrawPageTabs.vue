<script setup lang="ts">
import useWithdrawPageTabs, {
  tabs,
  Tab,
} from '@/composables/pools/useWithdrawPageTabs';

import { useExitPool } from '@/providers/local/exit-pool.provider';

/**
 * COMPOSABLES
 */
const { activeTab } = useWithdrawPageTabs();
const { setIsSingleAssetExit } = useExitPool();

watch(activeTab, value => {
  setIsSingleAssetExit(value === Tab.SingleToken);
});
</script>

<template>
  <BalTabs
    v-model="activeTab"
    :tabs="tabs"
    class="p-0 m-0 -mb-px whitespace-nowrap"
    noPad
  />
</template>
