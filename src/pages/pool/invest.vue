<script setup lang="ts">
import { configService } from '@/services/config/config.service';
// Components
import InvestForm from '@/components/forms/pool_actions/InvestForm/InvestForm2.vue';
import TradeSettingsPopover, {
  TradeSettingsContext
} from '@/components/popovers/TradeSettingsPopover.vue';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';

/**
 * STATE
 */
const { network } = configService;
const { pool, loadingPool, useNativeAsset } = usePoolTransfers();
</script>

<template>
  <div>
    <BalLoadingBlock v-if="loadingPool" class="h-96" />
    <BalCard v-else shadow="xl" exposeOverflow noBorder>
      <template #header>
        <div class="w-full">
          <div class="text-xs text-gray-500 leading-none">
            {{ network.chainName }}
          </div>
          <div class="flex items-center justify-between">
            <h4>{{ $t('investInPool') }}</h4>
            <TradeSettingsPopover :context="TradeSettingsContext.invest" />
          </div>
        </div>
      </template>
      <InvestForm :pool="pool" v-model:useNativeAsset="useNativeAsset" />
    </BalCard>
  </div>
</template>
