<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import InvestForm from '@/components/forms/pool_actions/InvestForm/InvestForm.vue';
import SwapSettingsPopover, {
  SwapSettingsContext,
} from '@/components/popovers/SwapSettingsPopover.vue';
import { usePool } from '@/composables/usePoolHelpers';
import { configService } from '@/services/config/config.service';
import InvestFormV2 from '@/components/forms/pool_actions/InvestForm/InvestFormV2.vue';
import useInvestPageTabs, {
  Tab,
  tabs,
} from '@/composables/pools/useInvestPageTabs';
import { useJoinPool } from '@/providers/local/join-pool.provider';
import { Pool } from '@balancer-labs/sdk';

type Props = {
  pool: Pool;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPUTED
 */
const pool = computed(() => props.pool);

/**
 * COMPOSABLES
 */
const { network } = configService;
const { activeTab, resetTabs } = useInvestPageTabs();
const { isDeepPool, isPreMintedBptPool } = usePool(pool);

const { setIsSingleAssetJoin } = useJoinPool();

watch(activeTab, value => {
  setIsSingleAssetJoin(value === Tab.SingleToken);
});

/**
 * CALLBACKS
 */
onMounted(() => resetTabs());
</script>

<template>
  <BalCard shadow="xl" exposeOverflow noBorder>
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

