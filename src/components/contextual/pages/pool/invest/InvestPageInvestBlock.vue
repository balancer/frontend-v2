<script setup lang="ts">
import { onBeforeMount, onMounted } from 'vue';
import useInvestState from '@/components/forms/pool_actions/InvestForm/composables/useInvestState';
import InvestForm from '@/components/forms/pool_actions/InvestForm/InvestForm.vue';
import TradeSettingsPopover, {
  TradeSettingsContext,
} from '@/components/popovers/TradeSettingsPopover.vue';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { usePool } from '@/composables/usePool';
import { forChange } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import InvestFormV2 from '@/components/forms/pool_actions/InvestForm/InvestFormV2.vue';
import useInvestPageTabs, { tabs } from '@/composables/pools/useInvestPageTabs';

/**
 * COMPOSABLES
 */
const { network } = configService;
const { pool, loadingPool, transfersAllowed } = usePoolTransfers();
const { sor, sorReady } = useInvestState();
const { activeTab, resetTabs } = useInvestPageTabs();
const { isDeepPool, isPreMintedBptPool } = usePool(pool);

/**
 * CALLBACKS
 */
onMounted(() => resetTabs());

onBeforeMount(async () => {
  await forChange(loadingPool, false);

  if (isDeepPool.value) {
    // Initialise SOR for batch swap queries
    sorReady.value = await sor.fetchPools();
  } else {
    sorReady.value = true;
  }
});
</script>

<template>
  <BalLoadingBlock
    v-if="loadingPool || !transfersAllowed || !sorReady || !pool"
    class="h-96"
  />
  <BalCard v-else shadow="xl" exposeOverflow noBorder>
    <template #header>
      <div class="w-full">
        <div class="text-xs leading-none text-secondary">
          {{ network.chainName }}
        </div>
        <div class="flex justify-between items-center">
          <h4>{{ $t('addLiquidity') }}</h4>
          <TradeSettingsPopover :context="TradeSettingsContext.invest" />
        </div>
        <BalTabs
          v-if="isDeepPool && isPreMintedBptPool"
          v-model="activeTab"
          :tabs="tabs"
          class="p-0 m-0 -mb-px whitespace-nowrap"
          noPad
        />
      </div>
    </template>
    <template v-if="isDeepPool">
      <InvestFormV2 :pool="pool" />
    </template>
    <template v-else>
      <InvestForm :pool="pool" />
    </template>
  </BalCard>
</template>

