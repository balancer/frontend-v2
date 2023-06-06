<script setup lang="ts">
import { buildNetworkIconUrlV2 } from '@/lib/utils/urls';
import IconLoaderWrapper from './IconLoaderWrapper.vue';
import CrossChainSyncModal from './CrossChainSyncModal.vue';

import useWeb3 from '@/services/web3/useWeb3';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useVeBal from '@/composables/useVeBAL';
import { useTokens } from '@/providers/tokens.provider';
import BigNumber from 'bignumber.js';
import { useCrossChainSync } from '@/providers/cross-chain-sync.provider';
import { NetworkSyncState } from '@/providers/cross-chain-sync.provider';

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
  setTempSyncingNetwors,
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
            <!-- <img
              class="cursor-pointer"
              src="@/assets/images/icons/update-unsynced.svg"
              alt=""
              @click="refetch"
            /> -->
          </div>
          <div class="flex mb-5">
            <span
              v-if="networksBySyncState.unsynced.length === 0"
              class="text-sm text-gray-600"
            >
              {{ $t('crossChainBoost.syncedAllDescription') }}
            </span>
            <div v-else class="flex">
              <div
                v-for="network in networksBySyncState.unsynced"
                :key="network"
              >
                <IconLoaderWrapper
                  :isLoading="
                    networksSyncState?.[network] === NetworkSyncState.Syncing ||
                    tempSyncingNetworks[account]?.networks.includes(network)
                  "
                >
                  <img
                    :src="buildNetworkIconUrlV2(network)"
                    alt=""
                    class="mr-2 rounded-full cursor-pointer"
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
            <!-- <img
              class="cursor-pointer"
              src="@/assets/images/icons/update-synced.svg"
              alt=""
              @click="refetch"
            /> -->
          </div>
          <span
            v-if="networksBySyncState.synced.length === 0"
            class="text-sm text-gray-600"
          >
            {{ $t('crossChainBoost.unsyncedAllDescription') }}
          </span>

          <div v-else class="flex">
            <div v-for="network in networksBySyncState.synced" :key="network">
              <IconLoaderWrapper :isLoading="false">
                <img
                  :src="buildNetworkIconUrlV2(network)"
                  alt=""
                  class="mr-2 w-8 h-8 rounded-full cursor-pointer"
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
      :setTempSyncingNetwors="setTempSyncingNetwors"
      :veBalBalance="fNum(veBalBalance, FNumFormats.token)"
      :l2VeBalBalances="l2VeBalBalances"
      @close-modal="onCloseModal"
    />
  </div>
</template>