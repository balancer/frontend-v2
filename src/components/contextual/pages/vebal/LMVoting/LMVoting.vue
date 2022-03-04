<script setup lang="ts">
import { computed } from 'vue';

import GaugesTable from '@/components/tables/GaugesTables/GaugesTable.vue';

import { Network } from '@balancer-labs/sdk';
import { PoolType } from '@/services/balancer/subgraph/types';

import { Pool } from './types';

import useWeb3 from '@/services/web3/useWeb3';
import useGauges from '@/composables/vebal/useGauges';

const { isWalletReady } = useWeb3();

const {
  gauges,
  isLoadingGauges,
} = useGauges();

const pools = computed<Pool[]>(() => [
  {
    id: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
    poolType: PoolType.Weighted,
    tokens: [
      {
        address: '0xba100000625a3754423978a60c9317c58a424e3D',
        symbol: 'BAL',
        weight: '0.8'
      },
      {
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        symbol: 'WETH',
        weight: '0.2'
      }
    ],
    chain: Network.MAINNET
  }
]);
</script>

<template>
  <h3 class="mb-3">{{ $t('veBAL.liquidityMining.title') }}</h3>
  <div class="mb-3">{{ $t('veBAL.liquidityMining.votingPeriod') }}</div>
  <Table :pools="pools" />
  <!-- <GaugesTable
    :isLoading="isLoadingGauges"
    :data="gauges"
    :noPoolsLabel="$t('noInvestments')"
    showPoolShares
    class="mb-8"
  /> -->
</template>
