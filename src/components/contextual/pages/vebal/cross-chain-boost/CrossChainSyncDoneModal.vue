<script setup lang="ts">
import { networkLabelMap } from '@/composables/useNetwork';
import { Network } from '@/lib/config';

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
    :title="$t('crossChainBoost.syncInitiatedModal.title')"
    @close="emit('closeModal')"
  >
    <div class="mb-5 text-sm text-gray-600">
      {{ $t('crossChainBoost.syncInitiatedModal.description') }}
    </div>
  </BalModal>
</template>