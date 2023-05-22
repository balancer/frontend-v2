<script setup lang="ts">
import { buildNetworkIconURL } from '@/lib/utils/urls';
import { Network } from '@/lib/config';
import IconLoaderWrapper from './IconLoaderWrapper.vue';
import CrossChainSyncModal from './CrossChainSyncModal.vue';

import {
  useCrossChainSync,
  NetworkSyncState,
} from '@/composables/cross-chain-sync/useCrossChainSync';
import useWeb3 from '@/services/web3/useWeb3';

/**
 * COMPOSABLES
 */
const { isWalletReady } = useWeb3();
const {
  omniEscrowLocks,
  votingEscrowLocks,
  networksSyncState,
  syncUnsyncState,
  isLoading,
  sync,
} = useCrossChainSync();

/**
 * State
 */
const isSyncModalOpen = ref(false);
const unsyncedNetworks = ref([Network.POLYGON, Network.ARBITRUM]);
</script>

<template>
  <div class="py-5 px-4">
    <div @click="sync">sync</div>
    <h3 class="mb-3">
      {{ $t('crossChainBoost.title') }}
      {{ networksSyncState }}
      {{ syncUnsyncState }}
    </h3>
    <div v-if="!isWalletReady">
      {{ $t('crossChainBoost.emptyState') }}
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
            v-if="syncUnsyncState.synced?.length === 0"
            class="text-sm text-gray-600"
          >
            {{ $t('crossChainBoost.unsyncedAllDescription') }}
          </span>

          <template v-else>
            <div
              v-for="network in syncUnsyncState.synced"
              :key="network"
              class="flex"
            >
              <IconLoaderWrapper>
                <img
                  :src="buildNetworkIconURL(Number(network))"
                  alt=""
                  class="mr-2 w-8 h-8 rounded-full cursor-pointer"
                />
              </IconLoaderWrapper>
            </div>
          </template>
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