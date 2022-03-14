<script lang="ts" setup>
import { computed } from 'vue';
import { flatten } from 'lodash';
import GaugesTable from '@/components/tables/GaugesTables/GaugesTable.vue';
import useGauges from '@/composables/vebal/useGauges';

const { poolsWithGauges, isLoadingGauges } = useGauges();

/**
 * Computed
 */

// Used as key so table will update when any gauge information changes
const gaugeInformation = computed(() => {
  // return poolsWithGauges.value.map((pool) => {
    // return pool.gauge;
  // });
  console.log("Recomputing gauge information");
  return flatten(poolsWithGauges.value);
});
</script>

<template>
  <h3 class="mb-3">{{ $t('veBAL.liquidityMining.title') }}</h3>
  <div class="mb-3">{{ $t('veBAL.liquidityMining.votingPeriod') }}</div>
  <GaugesTable
    :key="poolsWithGauges"
    :isLoading="isLoadingGauges"
    :data="poolsWithGauges"
    :noPoolsLabel="$t('noInvestments')"
    showPoolShares
    class="mb-8"
  />
</template>
