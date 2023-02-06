<script setup lang="ts">
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { computed, onUnmounted, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import BalActionSteps from '@/components/_global/BalActionSteps/BalActionSteps.vue';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import useEthers from '@/composables/useEthers';
import { usePool } from '@/composables/usePool';
import { dateTimeLabelFor } from '@/composables/useTime';
import useTokenApprovalActions from '@/composables/approvals/useTokenApprovalActions';
import useTransactions from '@/composables/useTransactions';
import useVeBal from '@/composables/useVeBAL';
import { Pool } from '@/services/pool/types';
import { TransactionActionInfo } from '@/types/transactions';
import useJoinPool from '@/composables/pools/useJoinPool';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { usePoolStaking } from '@/providers/local/pool-staking.provider';

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
  (e: 'showStakeModal'): void;
}>();

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { fNum2 } = useNumbers();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { lockablePoolId } = useVeBal();
const { isStakablePool } = usePoolStaking();
const { poolWeightsLabel } = usePool(toRef(props, 'pool'));
const {
  rektPriceImpact,
  amountsIn,
  fiatValueOut,
  join,
  txState,
  resetTxState,
  approvalActions: joinPoolApprovalActions,
} = useJoinPool();

const approvalActions = ref(joinPoolApprovalActions.value);

const tokensToApprove = computed(() =>
  amountsIn.value.map(amountIn => amountIn.address)
);
const amountsToApprove = computed(() =>
  amountsIn.value.map(amountIn => amountIn.value)
);
const { tokenApprovalActions } = useTokenApprovalActions(
  tokensToApprove.value,
  amountsToApprove
);

/**
 * COMPUTED
 */
const actions = computed((): TransactionActionInfo[] => [
  ...approvalActions.value,
  ...tokenApprovalActions,
  {
    label: t('addLiquidity'),
    loadingLabel: t('investment.preview.loadingLabel.investment'),
    confirmingLabel: t('confirming'),
    action: submit,
    stepTooltip: t('investmentTooltip'),
  },
]);

/**
 * METHODS
 */
async function handleTransaction(tx): Promise<void> {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'invest',
    summary: t('transactionSummary.investInPool', [
      fNum2(fiatValueOut.value, FNumFormats.fiat),
      poolWeightsLabel(props.pool),
    ]),
    details: {
      total: fNum2(fiatValueOut.value, FNumFormats.fiat),
      pool: props.pool,
    },
  });

  await txListener(tx, {
    onTxConfirmed: async (receipt: TransactionReceipt) => {
      emit('success', receipt);
      txState.receipt = receipt;

      const confirmedAt = await getTxConfirmedAt(receipt);
      txState.confirmedAt = dateTimeLabelFor(confirmedAt);
      txState.confirmed = true;
      txState.confirming = false;
    },
    onTxFailed: () => {
      console.error('Invest failed');
      txState.confirming = false;
    },
  });
}

onUnmounted(() => {
  // Reset tx state after Invest Modal is closed. Ready for another Invest transaction
  resetTxState();
});

async function submit(): Promise<TransactionResponse> {
  txState.init = true;
  try {
    const tx = await join();

    txState.confirming = true;

    handleTransaction(tx);
    return tx;
  } catch (error) {
    txState.confirming = false;
    throw new Error('Failed to submit transaction.', {
      cause: error,
    });
  } finally {
    txState.init = false;
  }
}
</script>

<template>
  <transition>
    <BalActionSteps
      v-if="!txState.confirmed || !txState.receipt"
      :actions="actions"
      :disabled="rektPriceImpact"
    />
    <div v-else>
      <ConfirmationIndicator :txReceipt="txState.receipt" />
      <BalBtn
        v-if="lockablePoolId === pool.id"
        tag="router-link"
        :to="{ name: 'get-vebal' }"
        color="gradient"
        block
        class="flex mt-2"
      >
        <StarsIcon class="mr-2 h-5 text-orange-300" />{{ $t('lockToGetVeBAL') }}
      </BalBtn>
      <BalBtn
        v-else-if="isStakablePool"
        color="gradient"
        block
        class="flex mt-2"
        @click="emit('showStakeModal')"
      >
        <StarsIcon class="mr-2 h-5 text-orange-300" />{{
          $t('stakeToGetExtra')
        }}
      </BalBtn>

      <BalBtn
        tag="router-link"
        :to="{ name: 'pool', params: { id: pool.id } }"
        color="gray"
        outline
        block
        class="mt-2"
      >
        {{ $t('returnToPool') }}
      </BalBtn>
    </div>
  </transition>
</template>
