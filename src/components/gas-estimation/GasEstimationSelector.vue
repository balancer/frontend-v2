<script setup lang="ts">
/**
 * TYPES
 */

import useGasPriceEstimationQuery from '@/services/gas-price/useGasPriceEstimationQuery';
import { computed, onMounted } from 'vue';
import useGasEstimationState from '@/components/gas-estimation/useGasEstimationState';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';

const { data, isLoading, refetch } = useGasPriceEstimationQuery();
const { selectedGasPrice, selectedGasPriceKey } = useGasEstimationState();

const estimations = computed(() => data.value);

async function refetchLoop() {
  await refetch.value();

  if (estimations.value) {
    selectedGasPrice.value = estimations.value[selectedGasPriceKey.value];
  }

  setTimeout(refetchLoop, 1500);
}

onMounted(async () => {
  refetchLoop();
});

const items = [
  {
    name: 'Standard',
    key: 'standardPriceGwei',
    estimatedTime: '30-60 secs',
    color: 'text-green-500'
  },
  {
    name: 'Fast',
    key: 'fastPriceGwei',
    estimatedTime: '10-30 secs',
    color: 'text-blue-500'
  },
  {
    name: 'Rapid',
    key: 'rapidPriceGwei',
    estimatedTime: '5-10 secs',
    color: 'text-red-500'
  }
];
</script>

<template>
  <div class="font-medium pb-2">
    Gas Price Estimation
    <BalTooltip
      text="To ensure your transactions are processed in a timely manner, select your desired gas price."
      icon-size="sm"
    />
  </div>
  <div class="flex">
    <div
      v-for="(item, i) in items"
      :key="item.id"
      :class="[
        'border rounded-lg p-2 cursor-pointer flex-1 select-none',
        i === items.length - 1 ? '' : 'mr-2',
        selectedGasPriceKey === item.key ? 'bg-white' : 'border-gray-700'
      ]"
      @click="
        () => {
          selectedGasPriceKey = item.key;
          selectedGasPrice = estimations ? estimations[item.key] : null;
        }
      "
    >
      <div
        :class="[
          'text-center font-medium',
          selectedGasPriceKey === item.key ? 'text-black' : ''
        ]"
      >
        {{ item.name }}
      </div>

      <BalLoadingBlock
        v-if="!estimations"
        class="h-6 my-1"
        :white="selectedGasPriceKey !== item.key"
      />
      <div v-else :class="['text-center text-xl my-1 font-medium', item.color]">
        {{ estimations[item.key] }} Gwei
      </div>
      <div
        :class="[
          'text-center',
          selectedGasPriceKey === item.key ? 'text-gray-800' : 'text-gray-400'
        ]"
      >
        ({{ item.estimatedTime }})
      </div>
    </div>
    <!--    <div
      class="border rounded-lg border-gray-700 p-2 cursor-pointer flex-1 mr-2"
    >
      <div class="text-center">Fast</div>
      <div class="text-center text-xl my-1 text-blue-500 font-medium">
        {{ estimations?.fastPriceGwei }} Gwei
      </div>
      <div class="text-center text-gray-400">(10-30 secs)</div>
    </div>
    <div class="border rounded-lg border-gray-700 p-2 cursor-pointer flex-1">
      <div class="text-center">Rapid</div>
      <div class="text-center text-xl my-1 text-red-500 font-medium">
        {{ estimations?.rapidPriceGwei }} Gwei
      </div>
      <div class="text-center text-gray-400">(5-10 secs)</div>
    </div>-->
  </div>
</template>
