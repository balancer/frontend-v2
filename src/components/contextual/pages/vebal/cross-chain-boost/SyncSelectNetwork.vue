<script setup lang="ts">
import { networkLabelMap } from '@/composables/useNetwork';

type Props = {
  unsyncedNetworks: number[];
  chosenNetworks: number[];
  activeTabIdx: number;
};

interface MyWallet {
  title: string;
  balance: number;
}

const myWallet = reactive<MyWallet>({
  title: 'Ethereum Mainnet',
  balance: 0,
});

const emit = defineEmits(['update:activeTabIdx', 'updateNetwork']);

const updateNetwork = number => {
  emit('updateNetwork', number);
};

const props = defineProps<Props>();

async function syncNetworks() {
  if (!props.chosenNetworks.length) return;
  emit('update:activeTabIdx', 1);
}
</script>

<template>
  <div class="flex flex-col">
    <div class="mb-1.5 text-lg font-bold">
      {{ $t('crossChainBoost.selectNetworkModal.title') }}
    </div>

    <div class="mb-5 text-sm text-gray-600">
      {{ $t('crossChainBoost.selectNetworkModal.description') }}
    </div>

    <div
      class="flex justify-between p-4 mb-3 rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-slate-100 dark:bg-slate-800"
    >
      <span>{{ myWallet.title }}</span>
      <div class="text-gray-600">{{ myWallet.balance.toFixed(4) }} veBal</div>
    </div>

    <div class="mb-5 rounded-lg border-2 border-gray-200 dark:border-gray-800">
      <div
        v-for="network in unsyncedNetworks"
        :key="network"
        class="flex justify-between items-center p-4 border-b-2 last:border-b-0 dark:border-gray-800"
      >
        <BalCheckbox
          noMargin
          alignCheckbox="items-center"
          :name="network.toString()"
          :modelValue="!!chosenNetworks.find(i => i === network)"
          :label="networkLabelMap[network]"
          @input="updateNetwork(Number(network))"
        />
        <div class="text-gray-600">0.0000 veBal</div>
      </div>
    </div>

    <div class="grow" />

    <BalBtn block color="gradient" size="md" @click="syncNetworks">
      {{ $t('next') }}
    </BalBtn>
  </div>
</template>
