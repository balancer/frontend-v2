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
        </div>
      </template>
      <InvestForm :pool="pool" />
    </BalCard>
  </div>
</template>
