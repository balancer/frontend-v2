<script setup lang="ts">
import { buildNetworkIconURL } from '@/lib/utils/urls';
import IconLoaderWrapper from './IconLoaderWrapper.vue';
import CrossChainSyncModal from './CrossChainSyncModal.vue';

import useWeb3 from '@/services/web3/useWeb3';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useVeBal from '@/composables/useVeBAL';
import { useTokens } from '@/providers/tokens.provider';
import BigNumber from 'bignumber.js';
import {
  useCrossChainSync,
  NetworkSyncState,
} from '@/providers/cross-chain-sync.provider';

/**
 * COMPOSABLES
 */
const { dynamicDataLoading } = useTokens();
const { account, isWalletReady } = useWeb3();
const {
  networksSyncState,
  networksBySyncState,
  l2VeBalBalances,
  isLoading,
  sync,
  tempSyncingNetworks,
  setTempSyncingNetworks,
  warningMessage,
  infoMessage,
  hasError,
} = useCrossChainSync();
const { fNum } = useNumbers();
const { veBalBalance } = useVeBal();

/**
 * STATE
 */
const isSyncModalOpen = ref(false);

/**
 * COMPUTED
 */
const isVebalBalanceZero = computed(() => {
  return new BigNumber(veBalBalance.value).isEqualTo(0);
});

/**
 * METHODS
 */
function onCloseModal() {
  isSyncModalOpen.value = false;
}
</script>

<template>
  <div class="py-5 px-4">
    <h3 class="mb-3">
      {{ $t('crossChainBoost.title') }}
      <BalTooltip :text="$t('crossChainBoost.infoDescription')">
        <template #activator>
          <BalIcon name="info" size="sm" class="text-gray-400" />
        </template>
      </BalTooltip>
    </h3>

    <BalAlert v-if="hasError" title="Error" type="error" class="mb-4">
      <div>
        Error has occured while fetching syncing states of some networks. Please
        refresh the page.
      </div>
    </BalAlert>

    <template v-if="!(isLoading || dynamicDataLoading)">
      <BalAlert
        v-if="warningMessage.title"
        :title="warningMessage.title"
        type="warning"
        class="mb-4"
      >
        {{ warningMessage.text }}
      </BalAlert>
      <BalAlert
        v-else-if="infoMessage.title"
        :title="infoMessage.title"
        type="tip"
        class="mb-4"
      >
        {{ infoMessage.text }}
      </BalAlert>
    </template>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <template v-if="isLoading || dynamicDataLoading">
        <BalLoadingBlock v-for="n in 2" :key="n" class="h-48" />
      </template>
      <div v-else-if="!isWalletReady || isVebalBalanceZero">
        {{ $t('crossChainBoost.emptyState') }}
      </div>
      <template v-else>
        <BalCard>
          <div class="flex justify-between items-center mb-3 font-bold label">
            {{ $t('crossChainBoost.unsyncedNetworks') }}
          </div>
          <div class="flex mb-5">
            <span
              v-if="networksBySyncState.unsynced.length === 0"
              class="text-sm text-gray-600"
            >
              {{ hasError ? '—' : $t('crossChainBoost.syncedAllDescription') }}
            </span>
            <div v-else class="flex">
              <div
                v-for="network in networksBySyncState.unsynced"
                :key="network"
                class="mr-2"
              >
                <IconLoaderWrapper
                  :isLoading="
                    networksSyncState?.[network] === NetworkSyncState.Syncing ||
                    tempSyncingNetworks[account]?.networks.includes(network)
                  "
                >
                  <img
                    :src="buildNetworkIconURL(network)"
                    alt=""
                    class="rounded-full w-[32px]"
                  />
                </IconLoaderWrapper>
              </div>
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
          <div class="flex justify-between items-center mb-3 font-bold label">
            {{ $t('crossChainBoost.syncedNetworks') }}
          </div>
          <span
            v-if="networksBySyncState.synced.length === 0"
            class="text-sm text-gray-600"
          >
            {{ hasError ? '—' : $t('crossChainBoost.unsyncedAllDescription') }}
          </span>

          <div v-else class="flex">
            <div v-for="network in networksBySyncState.synced" :key="network">
              <IconLoaderWrapper :isLoading="false">
                <img
                  :src="buildNetworkIconURL(network)"
                  alt=""
                  class="mr-2 w-8 h-8 rounded-full"
                />
              </IconLoaderWrapper>
            </div>
          </div>
        </BalCard>
      </template>
    </div>

    <CrossChainSyncModal
      :isVisible="isSyncModalOpen"
      :networksBySyncState="networksBySyncState"
      :sync="sync"
      :setTempSyncingNetworks="setTempSyncingNetworks"
      :veBalBalance="fNum(veBalBalance, FNumFormats.token)"
      :l2VeBalBalances="l2VeBalBalances"
      @close-modal="onCloseModal"
    />
  </div>
</template>