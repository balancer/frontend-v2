<script setup lang="ts">
import { Network } from '@/lib/config';
import { buildNetworkIconURL } from '@/lib/utils/urls';
import { TransactionActionInfo } from '@/types/transactions';
import { networkLabelMap } from '@/composables/useNetwork';
import { useI18n } from 'vue-i18n';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import {
  L2VeBalBalances,
  TempSyncingNetworks,
} from '@/providers/cross-chain-sync.provider';
import useTransactions from '@/composables/useTransactions';

/**
 * TYPES
 */
type Props = {
  chosenNetworks: Set<Network>;
  activeTabIdx: number;
  veBalBalance: string;
  l2VeBalBalances: L2VeBalBalances;
  sync(network: Network): Promise<TransactionResponse>;
  setTempSyncingNetwors(
    syncingNetworks: Network[]
  ): Record<string, TempSyncingNetworks>;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();
const emit = defineEmits(['update:activeTabIdx', 'setSuccessfulSynced']);

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { addTransaction } = useTransactions();

/**
 * STATE
 */
const currentActionIndex = ref(0);

/**
 * METHODS
 */
async function handleTransaction(
  tx: TransactionResponse,
  network: Network
): Promise<void> {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'sync',
    summary: `Sync veBal to ${networkLabelMap[network]} network`,
  });
}

async function handleAction(network: Network) {
  try {
    const tx = await props.sync(network);
    console.log('Receipt', tx);
    handleTransaction(tx, network);
    return tx;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

function handleSuccess() {
  const tempSyncingNetworks = props.setTempSyncingNetwors(
    Array.from(props.chosenNetworks)
  );
  localStorage.setItem(
    'tempSyncingNetworks',
    JSON.stringify(tempSyncingNetworks)
  );
  emit('setSuccessfulSynced');
  emit('update:activeTabIdx', 2);
}

/**
 * COMPUTED
 */
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
        return handleAction(network);
      },
      stepTooltip: t('crossChainBoost.syncToNetwork', {
        network: networkLabelMap[network],
      }),
    });
  });
  console.log('actions', actions);
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
            <div class="font-medium dark:text-gray-300">
              {{ $t('crossChainBoost.currentBalance') }}
            </div>
            <div class="font-bold text-black dark:text-white">
              {{ l2VeBalBalances?.[network] || '0.0000' }} veBAL
            </div>
          </div>
          <div class="p-4 w-6/12 text-gray-600 dark:text-gray-300">
            <div>{{ $t('crossChainBoost.postSyncBalance') }}</div>
            <div class="font-bold text-black dark:text-white">
              {{ veBalBalance || '0.0000' }} veBAL
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grow"></div>

    <BalActionSteps
      :actions="networkSyncSteps"
      :spacerWidth="10"
      @success="handleSuccess"
      @set-current-action-index="currentActionIndex = $event"
    />
  </div>
</template>
