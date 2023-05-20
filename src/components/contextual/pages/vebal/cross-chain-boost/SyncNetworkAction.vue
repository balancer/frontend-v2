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

const addVebalSync = number => {
  emit('addVebalSync', number);
  if (props.chosenNetworks.length === props.vebalSynced.length) {
    emit('update:activeTabIdx', 2);
  }
};

const horizSteps = computed(() => {
  const res: Step[] = [];
  props.chosenNetworks.filter(item =>
    props.vebalSynced.includes(item)
      ? res.push({ tooltip: '', state: StepState.Success })
      : false
  );
  if (currentNetwork.value) {
    res.push({ tooltip: '', state: StepState.Active });
  }
  let remainingLength = props.chosenNetworks.length - props.vebalSynced.length;
  if (remainingLength > 2) {
    remainingLength -= 1;
  }
  if (remainingLength > 1) {
    res.push({ tooltip: '', state: StepState.Todo });
  }
  return res;
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

    <BalHorizSteps
      class="justify-center mb-5"
      :steps="horizSteps"
      :spacerWidth="10"
    />

    <BalBtn
      block
      color="gradient"
      size="md"
      @click="addVebalSync(currentNetwork)"
    >
      Confirm veBAL sync
    </BalBtn>
  </div>
</template>
