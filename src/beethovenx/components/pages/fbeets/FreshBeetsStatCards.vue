<script setup lang="ts">
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import FreshBeetsAprTooltip from '@/beethovenx/components/pages/fbeets/FreshBeetsAprTooltip.vue';
import FarmHarvestRewardsCard from '@/beethovenx/components/pages/farm/FarmHarvestRewardsCard.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { useFreshBeets } from '@/beethovenx/composables/stake/useFreshBeets';
import useNumbers from '@/composables/useNumbers';
import { computed } from 'vue';

const { appNetworkConfig } = useWeb3();
const { fNum } = useNumbers();

const {
  fbeetsDecoratedFarm,
  totalBptStaked,
  totalSupply,
  beetsStaked,
  pool
} = useFreshBeets();

const swapApr = computed(() =>
  pool.value ? parseFloat(pool.value.dynamic.apr.total) : 0
);
const farmApr = computed(() =>
  fbeetsDecoratedFarm.value ? fbeetsDecoratedFarm.value.apr : 0
);
const fbeetsApr = computed(() => 0);
const totalApr = computed(
  () => swapApr.value + farmApr.value + fbeetsApr.value
);
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
    <!--    <template v-if="loading">
      <BalLoadingBlock v-for="n in 4" :key="n" class="h-24" />
    </template>
    <template v-else>-->
    <BalCard>
      <div class="text-sm text-gray-500 font-medium mb-2">
        TVL
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        {{ fNum(fbeetsDecoratedFarm?.tvl || '0', 'usd') }}
      </div>
    </BalCard>
    <BalCard>
      <div class="text-sm text-gray-500 font-medium mb-2">
        fBEETS Minted
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        {{ fNum(totalSupply.div(1e18).toString(), 'token') }}
      </div>
    </BalCard>
    <BalCard>
      <div class="text-sm text-gray-500 font-medium mb-2">
        BEETS Staked
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        {{ fNum(totalSupply.div(1e18).toString(), 'token') }}
      </div>
    </BalCard>

    <BalCard>
      <div class="text-sm text-gray-500 font-medium mb-2">
        APR
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        {{ fNum(totalApr || '0', 'percent') }}
        <FreshBeetsAprTooltip
          :swap-apr="swapApr"
          :farm-apr="farmApr"
          :fbeets-apr="fbeetsApr"
        />
      </div>
    </BalCard>
    <!--    </template>-->
  </div>
  <h4 class="px-4 lg:px-0 mb-4">Farm</h4>
  <div class="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          Farm TVL
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ fNum(fbeetsDecoratedFarm?.tvl || '0', 'usd') }}
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          BEETS
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          3,300 / day
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          My balance
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          ${{ fNum(totalSupply.div(1e18).toString(), 'token') }}
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          My share
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          0.10%
        </div>
      </BalCard>
    </div>
    <FarmHarvestRewardsCard
      :farm-id="appNetworkConfig.fBeets.farmId"
      :token-address="appNetworkConfig.fBeets.poolAddress"
      :pending-beets="fbeetsDecoratedFarm?.pendingBeets || 0"
      :pending-beets-value="fbeetsDecoratedFarm?.pendingBeetsValue || 0"
      :pending-reward-token-value="0"
      :pending-reward-token="0"
    />
  </div>
</template>
