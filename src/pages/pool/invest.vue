<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { configService } from '@/services/config/config.service';
// Components
import InvestForm from '@/components/forms/pool_actions/InvestForm/InvestForm.vue';
import TradeSettingsPopover, {
  TradeSettingsContext
} from '@/components/popovers/TradeSettingsPopover.vue';
// Composables
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { usePool } from '@/composables/usePool';
import { forChange } from '@/lib/utils';
import useInvestState from '@/components/forms/pool_actions/InvestForm/composables/useInvestState';
import { TOKENS } from '@/constants/tokens';

/**
 * STATE
 */
const { network } = configService;
const { pool, loadingPool, transfersAllowed } = usePoolTransfers();
const { isPhantomStablePool } = usePool(pool);
const { sor, sorReady, initBatchSwapQuery } = useInvestState();

/**
 * CALLBACKS
 */
onBeforeMount(async () => {
  await forChange(loadingPool, false);

  if (pool.value && isPhantomStablePool.value) {
    const tokenAddresses = TOKENS.Investable[pool.value.id].Tokens;

    // Initialise SOR for batch swap query
    const fetchedPools = await sor.fetchPools([], false);
    // Fetch batch swap for investable tokens using SOR with mock amountsIn.
    // This allows us to simply update the amountsIn values and not recalculate
    // the route every time.
    await initBatchSwapQuery(pool.value.address, tokenAddresses);
    sorReady.value = fetchedPools;
  } else {
    sorReady.value = true;
  }
});
</script>

<template>
  <div>
    <BalLoadingBlock
      v-if="loadingPool || !transfersAllowed || !sorReady"
      class="h-96"
    />
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
      <InvestForm :pool="pool" />
    </BalCard>
  </div>
</template>
