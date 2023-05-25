<script setup lang="ts">
import { networkLabelMap } from '@/composables/useNetwork';
import { Network } from '@/lib/config';
import {
  NetworkSyncUnsyncState,
  allNetworks,
} from '@/composables/cross-chain-sync/useCrossChainSync';

type Props = {
  syncUnsyncState: NetworkSyncUnsyncState;
  chosenNetworks: Set<Network>;
  veBalBalance: string;
  activeTabIdx: number;
};
const props = defineProps<Props>();
const emit = defineEmits(['update:activeTabIdx', 'toggleNetwork']);

const toggleNetwork = (network: Network) => {
  emit('toggleNetwork', network);
};

async function syncNetworks() {
  if (!props.chosenNetworks.size) return;
  emit('update:activeTabIdx', 1);
}
</script>

<template>
  <div class="flex flex-col">
    <div class="mb-1.5 text-lg font-bold">
      {{ $t('crossChainBoost.selectNetworkModal.title') }}
    </div>

    <div class="mb-5 text-sm text-gray-600">
      {{ $t('crossChainBoost.selectNetworkModal.description') }}
    </div>

    <div
      class="flex justify-between p-4 mb-3 rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-slate-100 dark:bg-slate-800"
    >
      <span>Ethereum</span>
      <div class="text-gray-600">{{ veBalBalance }} veBal</div>
    </div>

    <div class="mb-5 rounded-lg border-2 border-gray-200 dark:border-gray-800">
      <div
        v-for="network in allNetworks"
        :key="network"
        aria-disabled="true"
        class="border-b-2 last:border-b-0 dark:border-gray-800"
      >
        <div
          class="flex justify-between items-center p-4"
          :class="{
            'grayscale pointer-events-none opacity-40':
              syncUnsyncState.unsynced.includes(network),
          }"
        >
          <BalCheckbox
            noMargin
            alignCheckbox="items-center"
            :name="network.toString()"
            :modelValue="chosenNetworks.has(network)"
            :label="networkLabelMap[network]"
            @input="toggleNetwork(network)"
          />
          <div class="text-gray-600">0.0000 veBal</div>
        </div>
      </div>
    </div>

    <BalBtn block color="gradient" size="md" @click="syncNetworks">
      {{ $t('next') }}
    </BalBtn>
  </div>
</template>
