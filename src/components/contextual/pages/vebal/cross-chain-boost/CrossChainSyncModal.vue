<script setup lang="ts">
import { Network } from '@/lib/config';
import SyncSelectNetwork from '@/components/contextual/pages/vebal/cross-chain-boost/SyncSelectNetwork.vue';
import SyncNetworkAction from '@/components/contextual/pages/vebal/cross-chain-boost/SyncNetworkAction.vue';
import SyncFinalState from '@/components/contextual/pages/vebal/cross-chain-boost/SyncFinalState.vue';

type Props = {
  isVisible: boolean;
  unsyncedNetworks: Network[];
};

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
});

const emit = defineEmits(['closeModal']);

const chosenNetworks = ref<number[]>([]);
const vebalSynced = ref<number[]>([]);

const syncData = ref({
  unsyncedNetworks: props.unsyncedNetworks,
  chosenNetworks,
  vebalSynced,
});

const syncTabs = [SyncSelectNetwork, SyncNetworkAction, SyncFinalState];

const tabActiveIdx = ref(0);

const addVebalSync = number => {
  vebalSynced.value.push(number);
};

const closeModal = () => {
  emit('closeModal');
  tabActiveIdx.value = 0;
  chosenNetworks.value = [];
  vebalSynced.value = [];
};

function updateNetwork(network: number) {
  chosenNetworks.value.some(item => item === network)
    ? (chosenNetworks.value = chosenNetworks.value.filter(i => i !== network))
    : chosenNetworks.value.push(network);
}
</script>

<template>
  <BalModal :show="isVisible" @close="closeModal">
    <Transition name="fade" mode="out-in">
      <component
        :is="syncTabs[tabActiveIdx]"
        v-bind="syncData"
        v-model:activeTabIdx="tabActiveIdx"
        style="min-height: 470px"
        @update-network="updateNetwork"
        @add-vebal-sync="addVebalSync"
      />
    </Transition>
  </BalModal>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
