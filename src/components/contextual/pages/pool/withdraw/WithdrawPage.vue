<script setup lang="ts">
import WithdrawForm from '@/components/forms/pool_actions/WithdrawForm/WithdrawForm.vue';
import WithdrawFormV2 from '@/components/forms/pool_actions/WithdrawForm/WithdrawFormV2.vue';
import SwapSettingsPopover, {
  SwapSettingsContext,
} from '@/components/popovers/SwapSettingsPopover.vue';
import { configService } from '@/services/config/config.service';
import { usePoolHelper } from '@/composables/usePoolHelpers';
import useWithdrawPageTabs from '@/composables/pools/useWithdrawPageTabs';
import { Pool } from '@balancer-labs/sdk';
import WithdrawPageTabs from './WithdrawPageTabs.vue';
import { provideExitPool } from '@/providers/local/exit-pool.provider';

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
const { isDeepPool } = usePoolHelper(pool);
const { resetTabs } = useWithdrawPageTabs();
provideExitPool(pool);

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
        <WithdrawPageTabs v-if="isDeepPool" />
      </div>
    </template>
    <WithdrawFormV2 v-if="isDeepPool" />
    <WithdrawForm v-else :pool="pool" />
  </BalCard>
</template>
