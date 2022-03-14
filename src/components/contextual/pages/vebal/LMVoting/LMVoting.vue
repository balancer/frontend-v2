<script lang="ts" setup>
import { computed } from 'vue';
import { flatten } from 'lodash';
import GaugesTable from '@/components/tables/GaugesTables/GaugesTable.vue';
import useGauges from '@/composables/vebal/useGauges';
import useWeb3 from '@/services/web3/useWeb3';

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
