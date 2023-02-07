<script setup lang="ts">
import { computed, onMounted } from 'vue';
import InvestForm from '@/components/forms/pool_actions/InvestForm/InvestForm.vue';
import SwapSettingsPopover, {
  SwapSettingsContext,
} from '@/components/popovers/SwapSettingsPopover.vue';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { usePool } from '@/composables/usePool';
import { configService } from '@/services/config/config.service';
import InvestFormV2 from '@/components/forms/pool_actions/InvestForm/InvestFormV2.vue';
import useInvestPageTabs, { tabs } from '@/composables/pools/useInvestPageTabs';
import { hasFetchedPoolsForSor } from '@/lib/balancer.sdk';

/**
 * COMPOSABLES
 */
const { network } = configService;
const { pool, loadingPool, transfersAllowed } = usePoolTransfers();
const { activeTab, resetTabs } = useInvestPageTabs();
const { isDeepPool, isPreMintedBptPool } = usePool(pool);

/**
 * COMPUTED
 */
// We only need to wait for SOR if it's a deep pool.
const isLoadingSor = computed(
  (): boolean => isDeepPool.value && !hasFetchedPoolsForSor.value
);

const isLoading = computed(
  (): boolean =>
    loadingPool.value || !transfersAllowed.value || isLoadingSor.value
);

/**
 * CALLBACKS
 */
onMounted(() => resetTabs());
</script>

<template>
  <BalLoadingBlock v-if="isLoading || !pool" class="h-96" />
  <BalCard v-else shadow="xl" exposeOverflow noBorder>
    <template #header>
      <div class="w-full">
        <div class="text-xs leading-none text-secondary">
          {{ network.chainName }}
        </div>
        <div class="flex justify-between items-center">
          <h4>{{ $t('addLiquidity') }}</h4>
          <SwapSettingsPopover :context="SwapSettingsContext.invest" />
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

