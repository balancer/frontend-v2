<script setup lang="ts">
import WithdrawForm from '@/components/forms/pool_actions/WithdrawForm/WithdrawForm.vue';
import WithdrawFormV2 from '@/components/forms/pool_actions/WithdrawForm/WithdrawFormV2.vue';
import SwapSettingsPopover, {
  SwapSettingsContext,
} from '@/components/popovers/SwapSettingsPopover.vue';
import { configService } from '@/services/config/config.service';
import useWithdrawPageTabs from '@/composables/pools/useWithdrawPageTabs';
import WithdrawPageTabs from './WithdrawPageTabs.vue';
import { provideExitPool } from '@/providers/local/exit-pool.provider';
import { Pool } from '@/services/pool/types';

type Props = {
  pool: Pool;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const pool = toRef(props, 'pool');

/**
 * PROVIDERS
 */
provideExitPool(pool);

/**
 * COMPOSABLES
 */
const { network } = configService;
const { resetTabs } = useWithdrawPageTabs();

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
          <h4>{{ $t('withdrawFromPool') }}</h4>
          <SwapSettingsPopover :context="SwapSettingsContext.invest" />
        </div>
        <WithdrawPageTabs v-if="!(pool.isInRecoveryMode && pool.isPaused)" />
      </div>
    </template>
    <WithdrawFormV2 v-if="true" :pool="pool" />
    <!-- Temp support in case we need to re-enable old flow -->
    <WithdrawForm v-else :pool="pool" />
  </BalCard>
</template>
