<script setup lang="ts">
import { Network } from '@/lib/config';
import SyncSelectNetwork from '@/components/contextual/pages/vebal/cross-chain-boost/SyncSelectNetwork.vue';
import SyncNetworkAction from '@/components/contextual/pages/vebal/cross-chain-boost/SyncNetworkAction.vue';
import SyncFinalState from '@/components/contextual/pages/vebal/cross-chain-boost/SyncFinalState.vue';
import { TransactionResponse } from '@ethersproject/abstract-provider';

type Props = {
  isVisible: boolean;
  unsyncedNetworks: Network[];
  sync(network: Network): Promise<TransactionResponse>;
};

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
});

const emit = defineEmits(['closeModal']);

const chosenNetworks = ref<Set<Network>>(new Set());
const vebalSynced = ref<number[]>([]);

const syncData = {
  unsyncedNetworks: props.unsyncedNetworks,
  chosenNetworks,
  vebalSynced,
  sync: props.sync,
};

const syncTabs = [SyncSelectNetwork, SyncNetworkAction, SyncFinalState];

const tabActiveIdx = ref(0);

const addVebalSync = number => {
  vebalSynced.value.push(number);
};

const closeModal = () => {
  emit('closeModal');
  tabActiveIdx.value = 0;
  chosenNetworks.value = new Set();
  vebalSynced.value = [];
};

function toggleNetwork(network: number) {
  if (chosenNetworks.value.has(network)) {
    chosenNetworks.value.delete(network);
    return;
  }
  chosenNetworks.value.add(network);
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
        :chosenNetworks="chosenNetworks"
        @toggle-network="toggleNetwork"
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
