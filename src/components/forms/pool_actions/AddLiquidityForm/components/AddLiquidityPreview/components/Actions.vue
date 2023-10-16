<script setup lang="ts">
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { computed, onUnmounted, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import BalActionSteps from '@/components/_global/BalActionSteps/BalActionSteps.vue';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import { usePoolHelpers } from '@/composables/usePoolHelpers';
import useTransactions from '@/composables/useTransactions';
import useVeBal from '@/composables/useVeBAL';
import { Pool } from '@/services/pool/types';
import { TransactionActionInfo } from '@/types/transactions';
import { useJoinPool } from '@/providers/local/join-pool.provider';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { usePoolStaking } from '@/providers/local/pool-staking.provider';
import useWeb3 from '@/services/web3/useWeb3';
import useNetwork from '@/composables/useNetwork';
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
  (e: 'showStakeModal'): void;
}>();

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { fNum } = useNumbers();
const { addTransaction } = useTransactions();
const { lockablePoolId } = useVeBal();
const { isStakablePool } = usePoolStaking();
const { isMismatchedNetwork } = useWeb3();
const { poolWeightsLabel } = usePoolHelpers(toRef(props, 'pool'));
const {
  rektPriceImpact,
  fiatValueOut,
  join,
  txState,
  resetTxState,
  approvalActions: joinPoolApprovalActions,
} = useJoinPool();
const { networkSlug } = useNetwork();

const approvalActions = ref(joinPoolApprovalActions.value);

/**
 * COMPUTED
 */
const actions = computed((): TransactionActionInfo[] => [
  ...approvalActions.value,
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
async function handleSuccess(
  receipt: TransactionReceipt,
  confirmedAt: string
): Promise<void> {
  txState.receipt = receipt;
  txState.confirmedAt = confirmedAt;
  txState.confirmed = true;
  txState.confirming = false;
  emit('success', receipt);
}

function handleFailed() {
  txState.confirming = false;
}

async function submit(): Promise<TransactionResponse> {
  txState.init = true;
  try {
    const tx = await join();
    txState.confirming = true;

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'invest',
      summary: t('transactionSummary.investInPool', [
        fNum(fiatValueOut.value, FNumFormats.fiat),
        poolWeightsLabel(props.pool),
      ]),
      details: {
        total: fNum(fiatValueOut.value, FNumFormats.fiat),
        pool: props.pool,
      },
    });

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

/**
 * LIFECYCLE
 */
onUnmounted(() => {
  // Reset tx state after Invest Modal is closed. Ready for another Invest transaction
  resetTxState();
});
</script>

<template>
  <div>
    <transition>
      <BalActionSteps
        v-if="!txState.confirmed || !txState.receipt"
        :actions="actions"
        primaryActionType="invest"
        :disabled="rektPriceImpact || isMismatchedNetwork"
        @success="handleSuccess"
        @failed="handleFailed"
      />
      <div v-else>
        <ConfirmationIndicator :txReceipt="txState.receipt" />
        <BalBtn
          v-if="lockablePoolId === pool.id"
          tag="router-link"
          :to="{
            name: 'get-vebal',
            query: {
              returnRoute: $route.name,
              returnParams: JSON.stringify({
                id: pool.id,
                networkSlug,
              }),
            },
          }"
          color="gradient"
          block
          class="flex mt-2"
        >
          <StarsIcon class="mr-2 h-5 text-orange-300" />{{
            $t('lockToGetVeBAL')
          }}
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
          size="sm"
          class="mt-2"
        >
          {{ $t('returnToPool') }}
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
