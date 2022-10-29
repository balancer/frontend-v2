<script setup lang="ts">
import { computed } from 'vue';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { usePool } from '@/composables/usePool';
import useBreakpoints from '@/composables/useBreakpoints';
import InvestPageMyWallet from './InvestPageMyWallet.vue';
import InvestPageAccordion from './InvestPageAccordion.vue';
import InvestPageInvestBlock from './InvestPageInvestBlock.vue';

/**
 * COMPOSABLES
 */
const { pool } = usePoolTransfers();
const { isDeepPool } = usePool(pool);
const { upToLargeBreakpoint } = useBreakpoints();

/**
 * COMPUTED
 */
const poolSupportsGeneralisedJoin = computed<boolean>(() => {
  return !!(pool.value && isDeepPool.value);
});
</script>

<template>
  <div class="invest-page-layout-grid">
    <div v-if="!upToLargeBreakpoint" class="col-span-5">
      <InvestPageMyWallet
        :poolSupportsGeneralisedJoin="poolSupportsGeneralisedJoin"
      />
    </div>

    <div class="col-span-7">
      <InvestPageInvestBlock
        :poolSupportsGeneralisedJoin="poolSupportsGeneralisedJoin"
      ></InvestPageInvestBlock>
    </div>

    <InvestPageAccordion
      v-if="upToLargeBreakpoint"
      class="mt-4"
      :poolSupportsGeneralisedJoin="poolSupportsGeneralisedJoin"
    ></InvestPageAccordion>
  </div>
</template>

<style scoped>
.invest-page-layout-grid {
  @apply grid grid-cols-1 lg:grid-cols-12 gap-y-8;
  @apply max-w-3xl mx-auto sm:px-4 lg:px-0 gap-x-0 lg:gap-x-8;
}
</style>
