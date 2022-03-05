<script setup lang="ts">
import { computed } from 'vue';

import GaugesTable from '@/components/tables/GaugesTables/GaugesTable.vue';

import { Network } from '@balancer-labs/sdk';
import { PoolType } from '@/services/balancer/subgraph/types';

import { Pool } from './types';

import useWeb3 from '@/services/web3/useWeb3';
import useGauges from '@/composables/vebal/useGauges';

const { isWalletReady } = useWeb3();

const { gauges, isLoadingGauges } = useGauges();
</script>

<template>
  <h3 class="mb-3">{{ $t('veBAL.liquidityMining.title') }}</h3>
  <div class="mb-3">{{ $t('veBAL.liquidityMining.votingPeriod') }}</div>
  <GaugesTable
    :isLoading="isLoadingGauges"
    :data="gauges"
    :noPoolsLabel="$t('noInvestments')"
    showPoolShares
    class="mb-8"
  />
</template>
