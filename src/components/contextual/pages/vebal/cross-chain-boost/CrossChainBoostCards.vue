<script setup lang="ts">
import { buildNetworkIconURL } from '@/lib/utils/urls';
import IconLoaderWrapper from './IconLoaderWrapper.vue';
import CrossChainSyncModal from './CrossChainSyncModal.vue';

import {
  useCrossChainSync,
  NetworkSyncState,
} from '@/composables/cross-chain-sync/useCrossChainSync';
import useWeb3 from '@/services/web3/useWeb3';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useVeBal from '@/composables/useVeBAL';

/**
 * COMPOSABLES
 */
const { isWalletReady } = useWeb3();
const { networksSyncState, networksBySyncState, isLoading, sync } =
  useCrossChainSync();
const { fNum } = useNumbers();
const { veBalBalance } = useVeBal();
/**
 * STATE
 */
const isSyncModalOpen = ref(false);

/**
 * COMPUTED
 */
</script>

<template>
  <div class="py-5 px-4">
    <h3 class="mb-3">
      {{ $t('crossChainBoost.title') }}
      <!-- {{ networksSyncState }}
      {{ networksBySyncState }} -->

      <BalTooltip :text="$t('crossChainBoost.infoDescription')">
        <template #activator>
          <BalIcon name="info" size="sm" class="text-gray-400" />
        </template>
      </BalTooltip>
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
            <span
              v-if="networksBySyncState.unsynced.length === 0"
              class="text-sm text-gray-600"
            >
              {{ $t('crossChainBoost.syncedAllDescription') }}
            </span>
            <div
              v-for="network in networksBySyncState.unsynced"
              :key="network"
              class="flex"
            >
              <IconLoaderWrapper
                :isLoading="
                  networksSyncState?.[network] === NetworkSyncState.Syncing
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
            v-if="networksBySyncState.unsynced.length > 0"
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
            v-if="networksBySyncState.synced.length === 0"
            class="text-sm text-gray-600"
          >
            {{ $t('crossChainBoost.unsyncedAllDescription') }}
          </span>

          <template v-else>
            <div
              v-for="network in networksBySyncState.synced"
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
      :networksBySyncState="networksBySyncState"
      :sync="sync"
      :veBalBalance="fNum(veBalBalance, FNumFormats.token)"
      @close-modal="isSyncModalOpen = false"
    />
  </div>
</template>