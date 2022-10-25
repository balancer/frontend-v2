<script setup lang="ts">
import { onBeforeMount } from 'vue';

import useInvestState from '@/components/forms/pool_actions/InvestForm/composables/useInvestState';
// Components
import InvestForm from '@/components/forms/pool_actions/InvestForm/InvestForm.vue';
import TradeSettingsPopover, {
  TradeSettingsContext,
} from '@/components/popovers/TradeSettingsPopover.vue';
// Composables
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { usePool } from '@/composables/usePool';
import { forChange } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import InvestFormV2 from '@/components/forms/pool_actions/InvestForm/InvestFormV2.vue';
import InvestFormDeepPoolMultiToken from '@/components/forms/pool_actions/InvestForm/InvestFormDeepPoolMultiToken.vue';

import { JoinPoolProvider } from '@/providers/local/join-pool.provider';
import { activeTab, Tabs, tabs } from './investTabsState';

/**
 * STATE
 */
const { network } = configService;
const { pool, loadingPool, transfersAllowed } = usePoolTransfers();
const { isDeepPool } = usePool(pool);
const { sor, sorReady } = useInvestState();

/**
 * CALLBACKS
 */
onBeforeMount(async () => {
  await forChange(loadingPool, false);

  if (pool.value && isDeepPool.value) {
    // Initialise SOR for batch swap queries
    sorReady.value = await sor.fetchPools();
  } else {
    sorReady.value = true;
  }
});
</script>

<template>
  <div>
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
            <h4>{{ $t('investInPool') }}</h4>
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
      <template v-if="isDeepPool">
        <JoinPoolProvider :pool="pool">
          <InvestFormDeepPoolMultiToken
            v-if="activeTab === Tabs.POOL_TOKENS"
            :pool="pool"
          />
          <InvestFormV2 v-else :pool="pool" />
        </JoinPoolProvider>
      </template>
      <template v-else>
        <InvestForm :pool="pool" />
      </template>
    </BalCard>
  </div>
</template>
