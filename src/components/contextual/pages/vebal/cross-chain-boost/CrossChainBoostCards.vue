<script setup lang="ts">
import { buildNetworkIconURL } from '@/lib/utils/urls';
import { Network } from '@balancer-labs/sdk';
import IconLoaderWrapper from './IconLoaderWrapper.vue';
import CrossChainSyncModal from './CrossChainSyncModal.vue';

const unsyncedNetworks = ref([Network.POLYGON, Network.ARBITRUM]);
const syncedNetworks = ref([]);
const isSyncModalOpen = ref(false);

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
  <div>
    <h3 class="mb-3">
      {{ $t('crossChainBoost.title') }}
    </h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <!-- <template v-if="isLoading">
        <BalLoadingBlock v-for="n in 4" :key="n" class="h-24" />
      </template> -->
      <BalCard>
        <div class="mb-3 font-medium label">
          {{ $t('crossChainBoost.unsyncedNetworks') }}
        </div>
        <div class="flex mb-5">
          <div v-for="network in unsyncedNetworks" :key="network" class="flex">
            <IconLoaderWrapper :isLoading="true">
              <img
                :src="buildNetworkIconURL(network)"
                :alt="''"
                class="mr-2 w-8 h-8 rounded-full cursor-pointer"
              />
            </IconLoaderWrapper>
          </div>
        </div>

        <BalBtn color="blue" size="sm" outline @click="isSyncModalOpen = true">
          {{ $t('crossChainBoost.sync') }}
        </BalBtn>
      </BalCard>

      <BalCard>
        <div class="font-medium label">
          {{ $t('crossChainBoost.syncedNetworks') }}
        </div>
      </BalCard>
    </div>

    <CrossChainSyncModal
      :isVisible="isSyncModalOpen"
      @close-modal="isSyncModalOpen = false"
    ></CrossChainSyncModal>
  </div>
</template>