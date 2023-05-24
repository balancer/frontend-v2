<script setup lang="ts">
import { Network } from '@/lib/config';
import { buildNetworkIconURL } from '@/lib/utils/urls';
import { TransactionActionInfo } from '@/types/transactions';
import { networkLabelMap } from '@/composables/useNetwork';
import { useI18n } from 'vue-i18n';
import { TransactionResponse } from '@ethersproject/abstract-provider';

type Props = {
  chosenNetworks: Set<Network>;
  vebalSynced: number[];
  activeTabIdx: number;
  sync(network: Network): Promise<TransactionResponse>;
};

const props = defineProps<Props>();
defineEmits(['addVebalSync', 'update:activeTabIdx']);

const { t } = useI18n();

const currentActionIndex = ref(0);
const currentNetwork = computed(() => {
  return [...props.chosenNetworks][0];
});

const networkSyncSteps = computed(() => {
  const actions: TransactionActionInfo[] = [];
  props.chosenNetworks.forEach(network => {
    actions.push({
      label: t('crossChainBoost.syncToNetwork', {
        network: networkLabelMap[network],
      }),
      loadingLabel: t('crossChainBoost.syncingToNetwork', {
        network: networkLabelMap[network],
      }),
      confirmingLabel: t('crossChainBoost.syncingToNetwork', {
        network: networkLabelMap[network],
      }),
      action: async () => {
        return await props.sync(network);
      },
      stepTooltip: t('crossChainBoost.syncToNetwork', {
        network: networkLabelMap[network],
      }),
    });
  });

  return actions;
});
</script>

<template>
  <div class="flex flex-col">
    <div class="mb-1.5 text-lg font-bold">Sync veBAL</div>
    <div class="mb-5 text-sm text-gray-600">
      {{ $t('crossChainBoost.syncNetworkAction.title') }}
    </div>

    <div
      v-for="network in chosenNetworks.values()"
      :key="network"
      class="mb-4 rounded-lg border-2 border-gray-200 dark:border-gray-800"
    >
      <div
        class="flex items-center py-1 px-4 border-b-2 border-gray-200 dark:border-gray-800 bg-slate-100 dark:bg-slate-800"
      >
        <img
          :src="buildNetworkIconURL(network)"
          alt=""
          class="mr-2 w-8 h-8 rounded-full cursor-pointer"
        />
        <div class="font-semibold">{{ networkLabelMap[network] }}</div>
      </div>

      <div>
        <div class="flex border-b-2 last:border-b-0 dark:border-gray-800">
          <div class="p-4 w-6/12 text-gray-600 border-r-2 dark:border-gray-800">
            <div class="font-medium dark:text-gray-300">Current Balance</div>
            <div class="font-bold text-black dark:text-white">0.0000 veBAL</div>
          </div>
          <div class="p-4 w-6/12 text-gray-600 dark:text-gray-300">
            <div>Synced balanced</div>
            <div class="font-bold text-black dark:text-white">
              179.1032 veBAL
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grow"></div>

    <BalActionSteps
      :actions="networkSyncSteps"
      :spacerWidth="10"
      @set-current-action-index="currentActionIndex = $event"
    />
  </div>
</template>
