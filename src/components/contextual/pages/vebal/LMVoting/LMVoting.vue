<script lang="ts" setup>
import { defineComponent, computed } from 'vue';

import GaugesTable from '@/components/tables/GaugesTables/GaugesTable.vue';

import { Network } from '@balancer-labs/sdk';
import { PoolType } from '@/services/balancer/subgraph/types';

import { PoolToken, PoolWithGauge } from '@/services/balancer/subgraph/types';

import useWeb3 from '@/services/web3/useWeb3';
import useGauges from '@/composables/vebal/useGauges';

const { isWalletReady } = useWeb3();

const { gauges, isLoadingGauges } = useGauges();

const staticGauges = computed<PoolWithGauge[]>(() => {
  return [
    {
      id: '0x3a19030ed746bd1c3f2b0f996ff9479af04c5f0a000200000000000000000004',
      address: '0x3a19030ed746bd1c3f2b0f996ff9479af04c5f0a',
      poolType: PoolType.Weighted,
      swapFee: '0.008',
      owner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
      factory: '0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9',
      tokens: [
        {
          address: '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115',
          balance: '994368393.605508',
          weight: '0.5',
          priceRate: '1',
          symbol: 'USDC'
        },
        {
          address: '0xdfcea9088c8a88a76ff74892c1457c17dfeef9c1',
          balance: '35427.954203517678725801',
          weight: '0.5',
          priceRate: '1',
          symbol: 'WETH'
        }
      ],
      tokensList: [
        '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115',
        '0xdfcea9088c8a88a76ff74892c1457c17dfeef9c1'
      ],
      tokenAddresses: [
        '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115',
        '0xdfcea9088c8a88a76ff74892c1457c17dfeef9c1'
      ],
      totalLiquidity: '',
      miningTotalLiquidity: '',
      totalShares: '',
      totalSwapFee: '',
      totalSwapVolume: '',
      hasLiquidityMiningRewards: true,
      createTime: 1619183152,
      chain: {
        id: 'kovan',
        name: 'Kovan'
      },
      gauge: {
        address: '0x5BE3BBb5d7497138B9e623506D8b6C6cd72daceb',
        votes: '964912280891999261',
        userVotes: '55'
      }
    },
    {
      id: '0xf767f0a3fcf1eafec2180b7de79d0c559d7e7e370001000000000000000003e3',
      address: '0xf767f0a3fcf1eafec2180b7de79d0c559d7e7e37',
      poolType: PoolType.Weighted,
      swapFee: '0.0001',
      owner: '0x0000000000000000000000000000000000000000',
      factory: '0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9',
      tokens: [
        {
          address: '0x1c8e3bcb3378a443cc591f154c5ce0ebb4da9648',
          balance: '38.05432372',
          weight: '0.1667',
          priceRate: '1',
          symbol: 'WBTC'
        },
        {
          address: '0x41286bb1d3e870f3f750eb7e1c25d7e48c8a1ac7',
          balance: '1553540.386128486969009895',
          weight: '0.5',
          priceRate: '1',
          symbol: 'BAL'
        },
        {
          address: '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115',
          balance: '11199670.6176',
          weight: '0.3333',
          priceRate: '1',
          symbol: 'USDC'
        }
      ],
      tokensList: [
        '0x1c8e3bcb3378a443cc591f154c5ce0ebb4da9648',
        '0x41286bb1d3e870f3f750eb7e1c25d7e48c8a1ac7',
        '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115'
      ],
      tokenAddresses: [
        '0x1c8e3bcb3378a443cc591f154c5ce0ebb4da9648',
        '0x41286bb1d3e870f3f750eb7e1c25d7e48c8a1ac7',
        '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115'
      ],
      totalLiquidity: '',
      miningTotalLiquidity: '',
      totalShares: '',
      totalSwapFee: '',
      totalSwapVolume: '13650593.20926242376105278936436971',
      hasLiquidityMiningRewards: true,
      createTime: 1637272240,
      chain: {
        id: 'kovan',
        name: 'Kovan'
      },
      gauge: {
        address: '0xF5E1F2Ae2a4CEEeB1786c650856fDA2a27796F87',
        votes: '35087719108000738',
        userVotes: '2'
      }
    }
  ];
});

const compareGauges = computed(() => {
  console.log('gauges:', gauges.value);
  console.log('staticGauges:', staticGauges.value);
  return gauges.value == staticGauges.value;
});
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
  {{ compareGauges }}
</template>
