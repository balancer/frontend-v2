<script lang="ts" setup>
import GaugesTable from './GaugesTable.vue';
import useVotingGauges from '@/composables/useVotingGauges';

/**
 * COMPOSABLES
 */
const { isLoading, votingGauges, refetch } = useVotingGauges();
</script>

<template>
  <h3 class="mb-3">{{ $t('veBAL.liquidityMining.title') }}</h3>
  <div class="mb-3">{{ $t('veBAL.liquidityMining.votingPeriod') }}</div>
  <GaugesTable
    :isLoading="isLoading"
    :data="votingGauges"
    :key="votingGauges"
    :refetch="refetch"
    :noPoolsLabel="$t('noInvestments')"
    showPoolShares
    class="mb-8"
  />
</template>
