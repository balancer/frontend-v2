<script setup lang="ts">
import { buildNetworkIconURL } from '@/lib/utils/urls';
import { Network } from '@/lib/config';
import IconLoaderWrapper from './IconLoaderWrapper.vue';
import CrossChainSyncModal from './CrossChainSyncModal.vue';

import {
  useCrossChainSync,
  NetworkSyncState,
} from '@/composables/cross-chain-sync/useCrossChainSync';

const unsyncedNetworks = ref([Network.POLYGON, Network.ARBITRUM]);

const isSyncModalOpen = ref(false);
const {
  omniEscrowLocks,
  votingEscrowLocks,
  networksSyncState,
  syncedNetworks,
  isLoading,
} = useCrossChainSync();

function openSyncModal() {
  isSyncModalOpen.value = true;
}
async function syncNetwork(network: Network) {
  const resp = await new Promise(res => {
    setTimeout(() => {
      res(true);
    }, 2000);
  });
}
</script>

<template>
  <div class="py-5 px-4">
    <h3 class="mb-3">
      {{ networksSyncState }}
      {{ syncedNetworks }}
      {{ $t('crossChainBoost.title') }}
    </h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <template v-if="isLoading">
        <BalLoadingBlock v-for="n in 2" :key="n" class="h-48" />
      </template>
      <template v-else>
        <BalCard>
          <div class="mb-3 font-bold label">
            {{ $t('crossChainBoost.unsyncedNetworks') }}
          </div>
          <div class="flex mb-5">
            <div
              v-for="network in unsyncedNetworks"
              :key="network"
              class="flex"
            >
              <IconLoaderWrapper
                :isLoading="
                  networksSyncState[network] === NetworkSyncState.Syncing
                "
              >
                <img
                  :src="buildNetworkIconURL(network)"
                  alt=""
                  class="mr-2 w-8 h-8 rounded-full cursor-pointer"
                />
              </IconLoaderWrapper>
            </div>
          </div>

          <BalBtn
            color="blue"
            size="sm"
            outline
            @click="isSyncModalOpen = true"
          >
            {{ $t('crossChainBoost.sync') }}
          </BalBtn>
        </BalCard>

        <BalCard>
          <div class="mb-3 font-bold label">
            {{ $t('crossChainBoost.syncedNetworks') }}
          </div>
          <span
            v-if="syncedNetworks.length === 0"
            class="text-sm text-gray-600"
          >
            {{ $t('crossChainBoost.unsyncedAllDescription') }}
          </span>

          <div v-for="network in syncedNetworks" :key="network" class="flex">
            <IconLoaderWrapper>
              <img
                :src="buildNetworkIconURL(Number(network))"
                alt=""
                class="mr-2 w-8 h-8 rounded-full cursor-pointer"
              />
            </IconLoaderWrapper>
          </div>
        </BalCard>
      </template>
    </div>

    <CrossChainSyncModal
      :isVisible="isSyncModalOpen"
      :unsyncedNetworks="unsyncedNetworks"
      @close-modal="isSyncModalOpen = false"
    />
  </div>
</template>