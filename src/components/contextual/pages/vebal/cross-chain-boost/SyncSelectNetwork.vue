<script setup lang="ts">
import configs from '@/lib/config';
import { Network } from '@/lib/config/types';
import {
  veBalSyncSupportedNetworks,
  useCrossChainSync,
} from '@/providers/cross-chain-sync.provider';
import useWeb3 from '@/services/web3/useWeb3';

type Props = {
  chosenNetworks: Set<Network>;
  veBalBalance: string;
  activeTabIdx: number;
};

const { account } = useWeb3();
const { networksBySyncState, l2VeBalBalances, tempSyncingNetworks } =
  useCrossChainSync();

const props = defineProps<Props>();
const emit = defineEmits(['update:activeTabIdx', 'toggleNetwork']);

const toggleNetwork = (network: Network) => {
  emit('toggleNetwork', network);
};

async function syncNetworks() {
  if (!props.chosenNetworks.size) return;
  emit('update:activeTabIdx', 1);
}
</script>

<template>
  <div class="flex flex-col">
    <div class="mb-1.5 text-lg font-bold">
      {{ $t('crossChainBoost.selectNetworkModal.title') }}
    </div>

    <div class="mb-5 text-sm text-secondary">
      {{ $t('crossChainBoost.selectNetworkModal.description') }}
    </div>

    <div
      class="flex justify-between p-4 -mb-0.5 rounded-t-lg border-2 border-gray-200 dark:border-gray-800 bg-slate-100 dark:bg-slate-800"
    >
      <span class="font-semibold">Ethereum</span>
      <div class="font-semibold">{{ veBalBalance }} veBAL</div>
    </div>

    <div
      class="mb-5 rounded-b-lg border-2 border-gray-200 dark:border-gray-800"
    >
      <div
        v-for="network in veBalSyncSupportedNetworks"
        :key="network"
        aria-disabled="true"
        class="border-b-2 last:border-b-0 dark:border-gray-800"
      >
        {{ tempSyncingNetworks.value }}
        <div
          class="flex justify-between items-center p-4"
          :class="{
            'grayscale pointer-events-none opacity-40':
              networksBySyncState.synced.includes(network) ||
              tempSyncingNetworks?.[account]?.networks.includes(network),
          }"
        >
          <BalCheckbox
            noMargin
            alignCheckbox="items-center"
            :name="network.toString()"
            :modelValue="chosenNetworks.has(network)"
            :label="configs[network].chainName"
            class="font-medium"
            @input="toggleNetwork(network)"
          />
          <div class="font-medium">
            {{ l2VeBalBalances?.[network] || '0.0000' }} veBAL
          </div>
        </div>
      </div>
    </div>

    <BalBtn
      block
      color="gradient"
      size="md"
      :disabled="chosenNetworks.size === 0"
      @click="syncNetworks"
    >
      {{ $t('next') }}
    </BalBtn>
  </div>
</template>
