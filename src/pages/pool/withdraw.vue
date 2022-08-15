<script setup lang="ts">
import WithdrawForm from '@/components/forms/pool_actions/WithdrawForm/WithdrawForm.vue';
import TradeSettingsPopover, {
  TradeSettingsContext,
} from '@/components/popovers/TradeSettingsPopover.vue';
// Composables
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { configService } from '@/services/config/config.service';

/**
 * STATE
 */
const { network } = configService;
const { pool, loadingPool, transfersAllowed } = usePoolTransfers();
</script>

<template>
  <div>
    <BalLoadingBlock
      v-if="loadingPool || !pool || !transfersAllowed"
      class="h-96"
    />
    <BalCard v-else shadow="xl" exposeOverflow noBorder>
      <template #header>
        <div class="w-full">
          <div class="text-xs leading-none text-secondary">
            {{ network.chainName }}
          </div>
          <div class="flex justify-between items-center">
            <h4>{{ $t('withdrawFromPool') }}</h4>
            <TradeSettingsPopover :context="TradeSettingsContext.invest" />
          </div>
        </div>
      </template>
      <WithdrawForm :pool="pool" />
    </BalCard>
  </div>
</template>
