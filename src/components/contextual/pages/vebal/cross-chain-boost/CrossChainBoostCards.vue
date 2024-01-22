<script setup lang="ts">
import { buildNetworkIconURL } from '@/lib/utils/urls';
import IconLoaderWrapper from './IconLoaderWrapper.vue';
import CrossChainSyncModal from './CrossChainSyncModal.vue';

import useWeb3 from '@/services/web3/useWeb3';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useVeBal from '@/composables/useVeBAL';
import { useTokens } from '@/providers/tokens.provider';
import { bnum } from '@/lib/utils';
import {
  useCrossChainSync,
  NetworkSyncState,
} from '@/providers/cross-chain-sync.provider';
import configs from '@/lib/config';
import { Network } from '@/lib/config/types';

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
  showingUnsyncedNetworks,
  syncLayerZeroTxLinks,
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
  return bnum(veBalBalance.value).isEqualTo(0);
});

/**
 * METHODS
 */

function getLoadingTooltipText(networkId: Network) {
  const time = networkId === Network.POLYGON ? 30 : 5;

  return `Syncing on ${configs[networkId].chainName} usually takes around ${time} mins. 
  Wait until it completes before restaking or triggering a gauge update on your
  ${configs[networkId].chainName} pools to get your maximum veBAL boost.`;
}

function checkIfNetworkSyncing(network: Network) {
  return (
    networksSyncState.value?.[network] === NetworkSyncState.Syncing ||
    tempSyncingNetworks.value[account.value]?.networks.includes(network)
  );
}
function onCloseModal() {
  isSyncModalOpen.value = false;
}
</script>

<template>
  <div class="py-5 px-4">
    <h4 class="mb-4 font-bold text-center">
      {{ $t('crossChainBoost.title') }}
      <BalTooltip :text="$t('crossChainBoost.infoDescription')">
        <template #activator>
          <BalIcon name="info" size="sm" class="text-gray-400" />
        </template>
      </BalTooltip>
    </h4>

    <BalAlert v-if="hasError" title="Error" type="error" class="mb-4">
      <div>
        Error has occured while fetching syncing states of some networks. Please
        refresh the page.
      </div>
    </BalAlert>

    <template v-if="!(isLoading || dynamicDataLoading)">
      <BalAlert
        v-if="warningMessage"
        :title="warningMessage.title"
        type="warning"
        class="mb-4"
      >
        {{ warningMessage.text }}
      </BalAlert>
      <BalAlert
        v-else-if="infoMessage"
        :title="infoMessage.title"
        type="tip"
        class="mb-4"
      >
        {{ infoMessage.text }}
      </BalAlert>

      <div
        v-if="!isWalletReady || isVebalBalanceZero"
        class="flex justify-center text-sm text-secondary"
      >
        {{ $t('crossChainBoost.emptyState') }}
      </div>
    </template>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
      <template v-if="isLoading || dynamicDataLoading">
        <BalLoadingBlock v-for="n in 2" :key="n" class="h-48" />
      </template>
      <template v-else-if="isWalletReady && !isVebalBalanceZero">
        <BalCard>
          <div class="flex justify-between items-center mb-3 font-bold label">
            {{ $t('crossChainBoost.unsyncedNetworks') }}
          </div>
          <div class="flex mb-3">
            <span
              v-if="showingUnsyncedNetworks.length === 0"
              class="text-sm text-secondary"
            >
              {{ hasError ? '—' : $t('crossChainBoost.syncedAllDescription') }}
            </span>
            <div v-else class="flex">
              <div
                v-for="network in showingUnsyncedNetworks"
                :key="network"
                class="mr-2"
              >
                <BalTooltip width="44" textAlign="center">
                  <template #activator>
                    <BalLink
                      :href="syncLayerZeroTxLinks[network]"
                      :disabled="
                        !checkIfNetworkSyncing(network) ||
                        !syncLayerZeroTxLinks[network]
                      "
                      external
                      noStyle
                      class="group flex items-center"
                    >
                      <IconLoaderWrapper
                        :isLoading="checkIfNetworkSyncing(network)"
                      >
                        <img
                          :src="buildNetworkIconURL(network)"
                          alt=""
                          class="p-0.5 rounded-full w-[32px]"
                        />
                      </IconLoaderWrapper>
                    </BalLink>
                  </template>

                  <div
                    v-if="checkIfNetworkSyncing(network)"
                    class="flex flex-col"
                  >
                    <span class="mb-1">
                      {{ getLoadingTooltipText(network) }}
                    </span>

                    <span
                      v-if="syncLayerZeroTxLinks[network]"
                      class="font-bold"
                    >
                      Click this icon to view Layerzero transaction
                    </span>
                  </div>
                  <div v-else>
                    <div class="flex mb-2">
                      <div class="flex justify-center p-1 mr-1 align-center">
                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                      </div>
                      <div>
                        <div class="text-sm text-secondary">Ethereum veBAL</div>
                        <div class="text-lg font-bold">
                          {{ Number(veBalBalance).toFixed(4) }}
                        </div>
                      </div>
                    </div>

                    <div class="flex">
                      <div class="flex justify-center p-1 mr-1 align-center">
                        <div class="w-2 h-2 rounded-full bg-rose-500"></div>
                      </div>
                      <div>
                        <div class="text-sm text-secondary">
                          {{ configs[network].chainName }} veBAL
                        </div>
                        <div class="text-lg font-bold">
                          {{ l2VeBalBalances?.[network] }}
                        </div>
                      </div>
                    </div>
                  </div>
                </BalTooltip>
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
            class="text-sm text-secondary"
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
