<script setup lang="ts">
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import useEthers from '@/composables/useEthers';
import { usePoolHelpers } from '@/composables/usePoolHelpers';
import { dateTimeLabelFor } from '@/composables/useTime';
import useNetwork from '@/composables/useNetwork';
import useTransactions from '@/composables/useTransactions';
// Types
import { Pool } from '@/services/pool/types';
// Composables
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionActionInfo } from '@/types/transactions';

import router from '@/plugins/router';
import { useExitPool } from '@/providers/local/exit-pool.provider';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'success', value: TransactionReceipt): void;
  (e: 'error'): void;
}>();

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { blockNumber, isMismatchedNetwork } = useWeb3();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { poolWeightsLabel } = usePoolHelpers(toRef(props, 'pool'));
const { networkSlug } = useNetwork();
const { fNum } = useNumbers();

const {
  txState,
  txInProgress,
  exit,
  isLoadingQuery,
  queryExitQuery,
  fiatTotalOut,
  approvalActions: exitPoolApprovalActions,
  shouldExitViaInternalBalance,
} = useExitPool();

const withdrawalAction: TransactionActionInfo = {
  label: t('withdraw.label'),
  loadingLabel: t('withdraw.preview.loadingLabel.withdraw'),
  confirmingLabel: t('confirming'),
  action: submit,
  stepTooltip: t('withdraw.preview.tooltips.withdrawStep'),
};

const actions = ref<TransactionActionInfo[]>([
  ...exitPoolApprovalActions.value,
  withdrawalAction,
]);

/**
 * COMPUTED
 */
const redirectLabel = computed<string>(() => {
  if (shouldExitViaInternalBalance.value) return t('manageVaultBalances');
  return t('returnToPool');
});

const txSummary = computed<string>(() => {
  if (shouldExitViaInternalBalance.value)
    return t('transactionSummary.withdrawToBalance', [
      fNum(fiatTotalOut.value, FNumFormats.fiat),
    ]);

  return t('transactionSummary.withdrawFromPool', [
    fNum(fiatTotalOut.value, FNumFormats.fiat),
    poolWeightsLabel(props.pool),
  ]);
});

/**
 * METHODS
 */
async function handleTransaction(tx): Promise<void> {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'withdraw',
    summary: txSummary.value,
    details: {
      total: fNum(fiatTotalOut.value, FNumFormats.fiat),
      pool: props.pool,
    },
  });

  txState.confirmed = await txListener(tx, {
    onTxConfirmed: async (receipt: TransactionReceipt) => {
      emit('success', receipt);
      txState.confirming = false;
      txState.receipt = receipt;

      const confirmedAt = await getTxConfirmedAt(receipt);
      txState.confirmedAt = dateTimeLabelFor(confirmedAt);
    },
    onTxFailed: () => {
      txState.confirming = false;
    },
  });
}

async function submit(): Promise<TransactionResponse> {
  try {
    const tx = await exit();

    txState.confirming = true;

    handleTransaction(tx);
    return tx;
  } catch (error) {
    txState.confirming = false;
    throw new Error('Failed to submit withdrawal transaction.', {
      cause: error,
    });
  } finally {
    txState.init = false;
  }
}

function redirect() {
  if (shouldExitViaInternalBalance.value) {
    router.push({ name: 'balances', params: { networkSlug } });
  } else {
    router.push({ name: 'pool', params: { networkSlug, id: props.pool.id } });
  }
}

/**
 * WATCHERS
 */
watch(blockNumber, () => {
  if (!isLoadingQuery.value && !txInProgress.value) {
    queryExitQuery.refetch();
  }
});
</script>


<template>
  <transition>
    <BalActionSteps
      v-if="!txState.confirmed || !txState.receipt"
      :actions="actions"
      :disabled="isMismatchedNetwork"
    />
    <div v-else>
      <ConfirmationIndicator :txReceipt="txState.receipt" />
      <BalBtn color="gray" outline block class="mt-2" @click="redirect">
        {{ redirectLabel }}
      </BalBtn>
    </div>
  </transition>
</template>
