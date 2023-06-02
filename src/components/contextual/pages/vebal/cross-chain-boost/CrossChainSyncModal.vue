<script setup lang="ts">
import { Network } from '@/lib/config';
import SyncSelectNetwork from '@/components/contextual/pages/vebal/cross-chain-boost/SyncSelectNetwork.vue';
import SyncNetworkAction from '@/components/contextual/pages/vebal/cross-chain-boost/SyncNetworkAction.vue';
import SyncFinalState from '@/components/contextual/pages/vebal/cross-chain-boost/SyncFinalState.vue';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import {
  L2VeBalBalances,
  NetworknetworksBySyncState,
} from '@/composables/cross-chain-sync/useCrossChainSync';

type Props = {
  isVisible: boolean;
  networksBySyncState: NetworknetworksBySyncState;
  veBalBalance: string;
  l2VeBalBalances: L2VeBalBalances;
  sync(network: Network): Promise<TransactionResponse>;
};

withDefaults(defineProps<Props>(), {
  isVisible: false,
});

const emit = defineEmits(['closeModal']);

const chosenNetworks = ref<Set<Network>>(new Set());

const syncTabs = [SyncSelectNetwork, SyncNetworkAction, SyncFinalState];

const tabActiveIdx = ref(0);

const isSyncedSuccessfull = ref(false);

const closeModal = () => {
  emit('closeModal', isSyncedSuccessfull.value ? chosenNetworks.value : null);

  tabActiveIdx.value = 0;
  chosenNetworks.value = new Set();
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
        v-model:activeTabIdx="tabActiveIdx"
        :networksBySyncState="networksBySyncState"
        :veBalBalance="veBalBalance"
        :l2VeBalBalances="l2VeBalBalances"
        :sync="sync"
        style="min-height: 470px"
        :chosenNetworks="chosenNetworks"
        @toggle-network="toggleNetwork"
        @set-successful-synced="isSyncedSuccessfull = true"
      />
    </Transition>
  </BalModal>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
