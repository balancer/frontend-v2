<script setup lang="ts">
import WithdrawForm from '@/components/forms/pool_actions/WithdrawForm/WithdrawForm.vue';
import WithdrawFormV2 from '@/components/forms/pool_actions/WithdrawForm/WithdrawFormV2.vue';
import TradeSettingsPopover, {
  TradeSettingsContext,
} from '@/components/popovers/TradeSettingsPopover.vue';
// Composables
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { ExitPoolProvider } from '@/providers/local/exit-pool.provider';
import { configService } from '@/services/config/config.service';
import { usePool } from '@/composables/usePool';
import useWithdrawPageTabs, {
  tabs,
  Tab,
} from '@/composables/pools/useWithdrawPageTabs';

/**
 * COMPOSABLES
 */
const { network } = configService;
const { pool, loadingPool, transfersAllowed } = usePoolTransfers();
const { isDeepPool } = usePool(pool);
const { activeTab } = useWithdrawPageTabs();
</script>

<template>
  <div class="px-4 sm:px-0 mx-auto max-w-md">
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
          <BalTabs
            v-if="isDeepPool"
            v-model="activeTab"
            :tabs="tabs"
            class="p-0 m-0 -mb-px whitespace-nowrap"
            noPad
          />
        </div>
      </template>
      <ExitPoolProvider
        v-if="isDeepPool"
        :isSingleAssetExit="activeTab === Tab.SingleToken"
        :pool="pool"
      >
        <WithdrawFormV2 :pool="pool" />
      </ExitPoolProvider>
      <WithdrawForm v-else :pool="pool" />
    </BalCard>
  </div>
</template>
