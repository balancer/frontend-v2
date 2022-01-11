<script setup lang="ts">
import { ref, computed, reactive, onBeforeMount, ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';

// Types
import { FullPool } from '@/services/balancer/subgraph/types';
import {
  TransactionReceipt,
  TransactionResponse
} from '@ethersproject/abstract-provider';

// Composables
import useWeb3 from '@/services/web3/useWeb3';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import { dateTimeLabelFor } from '@/composables/useTime';
import useConfig from '@/composables/useConfig';
import useRelayerApproval, {
  Relayer
} from '@/composables/trade/useRelayerApproval';

// Services
import { TransactionActionInfo } from '@/types/transactions';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
type Props = {
  fromPool: FullPool;
  toPool: FullPool;
  fromPoolTokenInfo: TokenInfo;
  toPoolTokenInfo: TokenInfo;
  totalFiatPoolInvestment: ComputedRef<string>;
};

type MigratePoolState = {
  init: boolean;
  confirming: boolean;
  confirmed: boolean;
  confirmedAt: string;
  receipt?: TransactionReceipt;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'success', value: TransactionReceipt): void;
}>();

/**
 * STATE
 */
const migratePoolState = reactive<MigratePoolState>({
  init: false,
  confirming: false,
  confirmed: false,
  confirmedAt: ''
});

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { networkConfig } = useConfig();
const { getProvider, explorerLinks } = useWeb3();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const batchRelayerApproval = useRelayerApproval(Relayer.BATCH);

const migrateAction: TransactionActionInfo = {
  label: t('migratePool.previewModal.actions.title'),
  loadingLabel: t('migratePool.previewModal.loadingLabel.loading'),
  confirmingLabel: t('confirming'),
  action: submit,
  stepTooltip: t('migratePool.previewModal.actions.migrationStep')
};

const actions = ref<TransactionActionInfo[]>([migrateAction]);

/**
 * COMPUTED
 */
const explorerLink = computed(() =>
  migratePoolState.receipt
    ? explorerLinks.txLink(migratePoolState.receipt.transactionHash)
    : ''
);

/**
 * METHODS
 */
async function handleTransaction(tx): Promise<void> {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'migratePool',
    summary: t('transactionSummary.migratePool', [
      props.totalFiatPoolInvestment.value,
      props.fromPoolTokenInfo.symbol,
      props.toPoolTokenInfo.symbol
    ]),
    details: {
      fromPool: props.fromPool,
      toPool: props.toPool,
      totalFiatPoolInvestment: props.totalFiatPoolInvestment.value
    }
  });

  migratePoolState.confirmed = await txListener(tx, {
    onTxConfirmed: async (receipt: TransactionReceipt) => {
      emit('success', receipt);
      migratePoolState.confirming = false;
      migratePoolState.receipt = receipt;

      const confirmedAt = await getTxConfirmedAt(receipt);
      migratePoolState.confirmedAt = dateTimeLabelFor(confirmedAt);
    },
    onTxFailed: () => {
      migratePoolState.confirming = false;
    }
  });
}

async function submit(): Promise<TransactionResponse> {
  try {
    let tx;
    migratePoolState.init = true;

    tx = await balancerContractsService.batchRelayer.stableExit(
      '',
      getProvider()
    );

    migratePoolState.init = false;
    migratePoolState.confirming = true;

    console.log('Receipt', tx);

    handleTransaction(tx);
    return tx;
  } catch (error) {
    migratePoolState.init = false;
    migratePoolState.confirming = false;
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  if (!batchRelayerApproval.isUnlocked.value) {
    // Prepend relayer approval action if batch relayer not approved
    actions.value.unshift(batchRelayerApproval.action.value);
  }
});
</script>

<template>
  <div>
    <BalActionSteps v-if="!migratePoolState.confirmed" :actions="actions" />
    <template v-else>
      <div
        class="flex items-center justify-between text-gray-400 dark:text-gray-600 mt-4 text-sm"
      >
        <div class="flex items-center">
          <BalIcon name="clock" />
          <span class="ml-2">
            {{ migratePoolState.confirmedAt }}
          </span>
        </div>
        <BalLink
          :href="explorerLink"
          external
          noStyle
          class="group flex items-center"
        >
          {{ networkConfig.explorerName }}
          <BalIcon
            name="arrow-up-right"
            size="sm"
            class="ml-px group-hover:text-pink-500 transition-colors"
          />
        </BalLink>
      </div>
    </template>
  </div>
</template>
