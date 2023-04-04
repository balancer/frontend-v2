<script setup lang="ts">
import { usePool } from '@/composables/usePool';
import useBreakpoints from '@/composables/useBreakpoints';
import InvestPageMyWallet from './InvestPageMyWallet.vue';
import InvestPageAccordion from './InvestPageAccordion.vue';
import InvestPageInvestBlock from './InvestPageInvestBlock.vue';
import { Pool } from '@balancer-labs/sdk';
import { computed } from 'vue';
import { provideJoinPool } from '@/providers/local/join-pool.provider';
import useDisabledJoinsGuard from '@/composables/contextual/pool-transfers/useDisabledJoinsGuard';

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
useDisabledJoinsGuard(props.pool);
const { isDeepPool } = usePool(pool);
const { upToLargeBreakpoint } = useBreakpoints();

provideJoinPool(pool);
</script>

<template>
  <div class="invest-page-layout-grid">
    <div v-if="!upToLargeBreakpoint" class="col-span-5">
      <InvestPageMyWallet :pool="pool" />
    </div>

    <div class="col-span-7">
      <InvestPageInvestBlock :pool="pool" />
    </div>

    <InvestPageAccordion
      v-if="upToLargeBreakpoint"
      :pool="pool"
      class="mt-4"
      :isDeepPool="isDeepPool"
    ></InvestPageAccordion>
  </div>
</template>

<style scoped>
.invest-page-layout-grid {
  @apply grid grid-cols-1 lg:grid-cols-12 gap-y-8 gap-x-0 lg:gap-x-8;
}
</style>
