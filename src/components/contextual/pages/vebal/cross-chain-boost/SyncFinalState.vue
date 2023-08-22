<script setup lang="ts">
import configs from '@/lib/config';
import { Network } from '@/lib/config/types';
import { useCrossChainSync } from '@/providers/cross-chain-sync.provider';

type Props = {
  chosenNetworks: Set<Network>;
  veBalBalance: string;
};

const { syncLayerZeroTxLinks } = useCrossChainSync();

defineProps<Props>();
defineEmits(['close']);
</script>

<template>
  <div>
    <div class="flex items-center mb-3 text-xl font-bold">
      <img
        src="/src/assets/images/icons/success-check.svg"
        alt=""
        class="mr-2"
      />
      {{ $t('crossChainBoost.syncInitiatedModal.title') }}
    </div>
    <div class="mb-6 text-sm text-gray-600 dark:text-gray-300">
      {{ $t('crossChainBoost.syncInitiatedModal.description') }}
    </div>
    <div
      class="overflow-hidden mb-5 rounded-lg border-2 border-gray-200 dark:border-gray-800"
    >
      <div
        class="flex border-b-2 last:border-b-0 border-gray-200 dark:border-gray-800 bg-slate-100 dark:bg-slate-800"
      >
        <div
          class="p-4 w-6/12 font-semibold text-black dark:text-gray-300 grow"
        >
          Ethereum Mainnet
        </div>
        <div class="p-4 text-sm font-medium text-black dark:text-gray-300">
          {{ veBalBalance }} veBAL
        </div>
      </div>
      <div
        v-for="network in chosenNetworks.values()"
        :key="network"
        class="flex border-b-2 last:border-b-0 dark:border-gray-800"
      >
        <div class="p-4 font-semibold text-black dark:text-gray-300 grow">
          {{ configs[network].chainName }}
        </div>
        <div
          class="p-4 text-sm font-medium text-gray-600"
          :class="{ 'pr-0': syncLayerZeroTxLinks[network] }"
        >
          {{ veBalBalance }} veBAL
        </div>

        <div
          v-if="syncLayerZeroTxLinks[network]"
          class="flex pr-2 pl-1 align-center"
        >
          <BalLink
            :href="syncLayerZeroTxLinks[network]"
            external
            noStyle
            class="group flex items-center"
          >
            <BalIcon
              name="arrow-up-right"
              size="sm"
              class="mb-1 ml-px group-hover:text-pink-500 transition-colors text-dark-grey"
            />
          </BalLink>
        </div>
      </div>
    </div>

    <BalAlert
      type="tip"
      :title="$t('crossChainBoost.syncInitiatedModal.warningTitle')"
      class="mb-8"
    >
      <div>
        {{ $t('crossChainBoost.syncInitiatedModal.warningDescription') }}
      </div>
    </BalAlert>

    <BalBtn color="gray" outline block @click="$emit('close')">
      {{ $t('close') }}
    </BalBtn>
  </div>
</template>
