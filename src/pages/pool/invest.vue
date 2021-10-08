<script setup lang="ts">
import { computed, ref } from 'vue';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import { useRoute } from 'vue-router';
import { FullPool } from '@/services/balancer/subgraph/types';
import InvestForm from '@/components/forms/pool_actions/InvestForm/InvestForm2.vue';
import TradeSettingsPopover, {
  TradeSettingsContext
} from '@/components/popovers/TradeSettingsPopover.vue';

/**
 * COMPOSABLES
 */
const route = useRoute();

/**
 * STATE
 */
const id = ref<string>(route.params.id as string);

/**
 * QUERIES
 */
const poolQuery = usePoolQuery(id.value);

/**
 * COMPUTED
 */
const pool = computed((): FullPool | undefined => {
  return poolQuery.data.value;
});

const loadingPool = computed(
  (): boolean =>
    (poolQuery.isLoading.value as boolean) ||
    (poolQuery.isIdle.value as boolean) ||
    (poolQuery.error.value as boolean)
);
</script>

<template>
  <div class="pb-16">
    <div class="invest-header mb-12">
      <div></div>
      <router-link :to="{ name: 'pool', params: { id } }">
        <BalIcon name="x" size="lg" />
      </router-link>
    </div>
    <div class="invest-container">
      <BalCard class="h-64 mt-12 col-span-2" shadow="none" />

      <div class="col-span-3">
        <BalLoadingBlock v-if="loadingPool || !pool" class="h-96" />
        <BalCard
          v-else
          :title="$t('investInPool')"
          shadow="xl"
          rightAlignHeader
          exposeOverflow
        >
          <template v-slot:header>
            <TradeSettingsPopover :context="TradeSettingsContext.invest" />
          </template>
          <InvestForm :pool="pool" />
        </BalCard>
      </div>

      <BalCard class="h-64 mt-12 col-span-2" shadow="none" />
    </div>
  </div>
</template>

<style scoped>
.invest-header {
  @apply h-16;
  @apply px-4 lg:px-6;
  @apply flex items-center justify-between;
}

.invest-container {
  @apply container mx-auto;
  @apply grid grid-cols-1 lg:grid-cols-7 gap-y-8 gap-x-0 lg:gap-x-8;
}
</style>
