<script setup lang="ts">
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import { usePoolHelpers } from '@/composables/usePoolHelpers';
import useNetwork from '@/composables/useNetwork';
import useTransactions from '@/composables/useTransactions';
// Types
import { Pool } from '@/services/pool/types';
// Composables
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionActionInfo } from '@/types/transactions';

import { useExitPool } from '@/providers/local/exit-pool.provider';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';

import FeedbackCard from '@/components/cards/FeedbackCard.vue';

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
  relayerApprovalTx,
  shouldExitViaInternalBalance,
  isTxPayloadReady,
  relayerSignature,
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

// Prevent the tx action with loading state if:
// 1. If the exit provider has not yet generated a tx payload, and
// 2. The user has signed the relayer or has already approved the relayer.
const isBuildingTx = computed((): boolean => {
  return (
    !isTxPayloadReady.value &&
    (!!relayerSignature.value || relayerApprovalTx.isUnlocked.value)
  );
});

/**
 * METHODS
 */
async function handleSuccess(
  receipt: TransactionReceipt,
  confirmedAt: string
): Promise<void> {
  txState.confirmed = true;
  txState.confirming = false;
  txState.receipt = receipt;
  txState.confirmedAt = confirmedAt;
  emit('success', receipt);
}

function handleFailed(): void {
  txState.confirming = false;
  emit('error');
}

async function submit(): Promise<TransactionResponse> {
  try {
    const tx = await exit();

    txState.confirming = true;

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

const returnRoute = computed(() => {
  if (shouldExitViaInternalBalance.value) {
    return { name: 'balances', params: { networkSlug } };
  } else {
    return { name: 'pool', params: { networkSlug, id: props.pool.id } };
  }
});

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
  <div>
    <transition>
      <BalActionSteps
        v-if="!txState.confirmed || !txState.receipt"
        :actions="actions"
        primaryActionType="withdraw"
        :disabled="isMismatchedNetwork"
        :isLoading="isBuildingTx"
        :loadingLabel="
          isBuildingTx
            ? $t('withdraw.preview.loadingLabel.building')
            : undefined
        "
        @success="handleSuccess"
        @failed="handleFailed"
      />
      <div v-else>
        <ConfirmationIndicator :txReceipt="txState.receipt" />
        <BalBtn
          tag="router-link"
          :to="returnRoute"
          color="gray"
          outline
          block
          class="mt-2"
        >
          {{ redirectLabel }}
        </BalBtn>
      </div>
    </transition>
    <transition name="pop">
      <FeedbackCard
        v-if="txState.confirming || txState.confirmed"
        class="mt-3"
      />
    </transition>
  </div>
</template>
