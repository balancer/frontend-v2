<script setup lang="ts">
import WithdrawForm from '@/components/forms/pool_actions/WithdrawForm/WithdrawForm.vue';
import WithdrawFormV2 from '@/components/forms/pool_actions/WithdrawForm/WithdrawFormV2.vue';
import SwapSettingsPopover, {
  SwapSettingsContext,
} from '@/components/popovers/SwapSettingsPopover.vue';
import { configService } from '@/services/config/config.service';
import { usePool } from '@/composables/usePool';
import useWithdrawPageTabs, {
  tabs,
  Tab,
} from '@/composables/pools/useWithdrawPageTabs';

import { computed, onMounted } from 'vue';
import { useExitPool } from '@/providers/local/exit-pool.provider';
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
const { isDeepPool } = usePool(pool);
const { activeTab, resetTabs } = useWithdrawPageTabs();
const { setIsSingleAssetExit } = useExitPool();

onMounted(() => resetTabs());

watch(activeTab, value => {
  setIsSingleAssetExit(value === Tab.SingleToken);
});
</script>

<template>
  <BalCard shadow="xl" exposeOverflow noBorder>
    <template #header>
      <div class="w-full">
        <div class="text-xs leading-none text-secondary">
          {{ network.chainName }}
        </div>
        <div class="flex justify-between items-center">
          <h4>{{ $t('withdrawFromPool') }}</h4>
          <SwapSettingsPopover :context="SwapSettingsContext.invest" />
        </div>
        <BalTabs
          v-if="isDeepPool"
          v-model="activeTab"
          :tabs="tabs"
          class="p-0 m-0 -mb-px whitespace-nowrap"
          noPad
        />
      </div>
    </template>
    <WithdrawFormV2 v-if="isDeepPool" />
    <WithdrawForm v-else :pool="pool" />
  </BalCard>
</template>
