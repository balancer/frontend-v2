<script setup lang="ts">
import { Step, StepState } from '@/types';
import { Network } from '@/lib/config';
import { buildNetworkIconURL } from '@/lib/utils/urls';

type Props = {
  chosenNetworks: number[];
  vebalSynced: number[];
  activeTabIdx: number;
};

const props = defineProps<Props>();

const emit = defineEmits(['addVebalSync', 'update:activeTabIdx']);

const currentNetwork = computed<number>(() => {
  return props.chosenNetworks.filter(
    item => !props.vebalSynced.includes(item)
  )[0];
});

const networkSyncSteps = computed(() => {
  return [
    {
      label: 'Sync veBAL to Arbitrum',
      loadingLabel: 'Syncing veBAL to Arbitrum',
      confirmingLabel: 'Syncing veBAL to Arbitrum',
      action: () => emit('update:activeTabIdx', 2),
      stepTooltip: 'Sync veBAL to Arbitrum',
    },
    {
      label: 'Sync veBAL to Arbitrum',
      loadingLabel: 'Syncing veBAL to Arbitrum',
      confirmingLabel: 'Syncing veBAL to Arbitrum',
      action: () => emit('update:activeTabIdx', 2),
      stepTooltip: 'Sync veBAL to Arbitrum',
    },
  ];
});
</script>

<template>
  <div class="flex flex-col">
    <div class="mb-1.5 text-lg font-bold">Sync veBAL to Arbitrum</div>
    <div class="mb-5 text-sm text-gray-600">
      This will sync your veBAL balance and give you a staking boost on
      Arbitrum.
    </div>

    <div
      class="overflow-hidden mb-4 rounded-lg border-2 border-gray-200 dark:border-gray-800"
    >
      <div
        class="flex items-center py-1 px-4 border-b-2 border-gray-200 dark:border-gray-800 bg-slate-100 dark:bg-slate-800"
      >
        <img
          :src="buildNetworkIconURL(currentNetwork)"
          :alt="''"
          class="mr-2 w-8 h-8 rounded-full cursor-pointer"
        />
        <div class="font-semibold">{{ Network[currentNetwork] }}</div>
      </div>

      <div>
        <div class="flex border-b-2 last:border-b-0 dark:border-gray-800">
          <div class="p-4 w-6/12 text-gray-600 border-r-2 dark:border-gray-800">
            <div class="font-medium dark:text-gray-300">Current Balance</div>
            <div class="font-bold text-black dark:text-white">0.0000 veBAL</div>
          </div>
          <div class="p-4 w-6/12 text-gray-600 dark:text-gray-300">
            <div>Synced balanced</div>
            <div class="font-bold text-black dark:text-white">
              179.1032 veBAL
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grow"></div>

    <BalActionSteps
      class="justify-center mb-5"
      :actions="networkSyncSteps"
      :spacerWidth="10"
    />
  </div>
</template>
