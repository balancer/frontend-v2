<script lang="ts" setup>
import GaugesTable from '@/components/tables/GaugesTables/GaugesTable.vue';
import useGauges from '@/composables/vebal/useGauges';

/**
 * COMPOSABLES
 */
const { poolsWithGauges, isLoadingGauges } = useGauges();
</script>

<template>
  <h3 class="mb-3">{{ $t('veBAL.liquidityMining.title') }}</h3>
  <div class="mb-3">{{ $t('veBAL.liquidityMining.votingPeriod') }}</div>
  <GaugesTable
    :isLoading="isLoadingGauges"
    :data="poolsWithGauges"
    :key="poolsWithGauges"
    :noPoolsLabel="$t('noInvestments')"
    showPoolShares
    class="mb-8"
  />
</template>
