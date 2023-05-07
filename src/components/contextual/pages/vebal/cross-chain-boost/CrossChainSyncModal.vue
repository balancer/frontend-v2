<script setup lang="ts">
import { networkLabelMap } from '@/composables/useNetwork';
import { Network } from '@balancer-labs/sdk';

type Props = {
  isVisible: boolean;
};

withDefaults(defineProps<Props>(), {
  isVisible: false,
});

const emit = defineEmits(['closeModal']);

const networksToSync = ref([Network.POLYGON, Network.ARBITRUM]);
const choosenNetworks = ref(new Set<Network>([Network.POLYGON]));

function updateNetwork(network: number) {
  choosenNetworks.value.has(network)
    ? choosenNetworks.value.add(network)
    : choosenNetworks.value.delete(network);
}

function syncNetworks() {
  //
}
</script>

<template>
  <BalModal
    :show="isVisible"
    :title="$t('crossChainBoost.syncModal.title')"
    @close="emit('closeModal')"
  >
    <div class="mb-5 text-sm text-gray-600">
      {{ $t('crossChainBoost.syncModal.description') }}
    </div>

    <div
      class="flex justify-between p-4 mb-3 rounded-lg border-2 border-gray-200"
    >
      <span>Ethereum Mainnet</span>
      <div class="text-gray-600">0.0000 veBal</div>
    </div>

    <div class="mb-5 rounded-lg border-2 border-gray-200">
      <div
        v-for="network in networksToSync"
        :key="network"
        class="flex justify-between items-center p-4 border-b-2 last:border-b-0"
      >
        <BalCheckbox
          noMargin
          alignCheckbox="items-center"
          :name="network.toString()"
          :modelValue="choosenNetworks.has(network)"
          :label="networkLabelMap[network]"
          @input="updateNetwork(Number(network))"
        />
        <div class="text-gray-600">0.0000 veBal</div>
      </div>
    </div>

    <BalBtn class="w-full" color="blue" size="md" outline @click="syncNetworks">
      {{ $t('next') }}
    </BalBtn>
  </BalModal>
</template>