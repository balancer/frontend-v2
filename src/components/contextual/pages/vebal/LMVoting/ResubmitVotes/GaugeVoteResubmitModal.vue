<script lang="ts" setup>
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import useEthers from '@/composables/useEthers';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { dateTimeLabelFor } from '@/composables/useTime';
import useTransactions from '@/composables/useTransactions';
import { bnum, scale } from '@/lib/utils';
import { gaugeControllerService } from '@/services/contracts/gauge-controller.service';
import { Address, WalletError } from '@/types';
import useVotingEscrowLocks from '@/composables/useVotingEscrowLocks';
import useVotingGauges from '@/composables/useVotingGauges';
import VoteInput from './VoteInput.vue';
import SubmitVoteBtn from '../SubmitVoteBtn.vue';
import { POOLS } from '@/constants/pools';
import useActionState, { State } from '@/composables/useActionState';

/**
 * PROPS & EMITS
 */
const emit = defineEmits<{
  (e: 'close'): void;
}>();

/**
 * COMPOSABLES
 */
const { gaugesUsingUnderUtilizedVotingPower } = useVotingEscrowLocks();
const { votingGauges, refetch: refetchVotingGauges } = useVotingGauges();
const voteState = useActionState();
const { t } = useI18n();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { fNum2 } = useNumbers();

/**
 * STATE
 */
const votes = ref<Record<Address, string>>({});

/**
 * COMPUTED
 */

//  Can vote max 8 gauges in one time
const visibleVotingGauges = computed(() =>
  gaugesUsingUnderUtilizedVotingPower.value.slice(0, 8)
);

// All other gauges using under-utilized voting power are grouped separately
const hiddenVotingGauges = computed(() =>
  gaugesUsingUnderUtilizedVotingPower.value.slice(7)
);

const allGaugesTotalAllocation = computed<number>(() => {
  const underUtilizedAddresses = gaugesUsingUnderUtilizedVotingPower.value.map(
    gauge => gauge.address
  );

  return votingGauges.value.reduce<number>((total, gauge) => {
    return !underUtilizedAddresses.includes(gauge.address)
      ? total + Number(bpsToPct(gauge.userVotes))
      : total + Number(votes.value[gauge.address]);
  }, 0);
});

const hasMoreThan8VotingGauges = computed(
  () => gaugesUsingUnderUtilizedVotingPower.value.length > 8
);

const hiddenVotesTotalAllocation = computed<number>(() => {
  const totalUnscaled = hiddenVotingGauges.value.reduce<number>(
    (total, gauge) => total + Number(gauge.userVotes),
    0
  );
  return Number(bpsToPct(totalUnscaled));
});

const voteButtonDisabled = computed<boolean>(
  () => allGaugesTotalAllocation.value > 100
);
const transactionInProgress = computed(
  (): boolean =>
    voteState.state.value === State.TRANSACTION_INITIALIZED ||
    voteState.state.value === State.CONFIRMING
);
const totalAllocationClass = computed(() => ({
  'total-allocation-disabled': voteButtonDisabled.value,
  'total-allocation mt-3 flex justify-between': true,
}));

/**
 * METHODS
 */
function bpsToPct(weight: string | number): string {
  return scale(bnum(weight || '0'), -2).toString();
}

async function submitVote() {
  // Gauge Controller requires a fixed 8 Gauge Addresses
  // We take the first 8 Voting Gauges
  // If there's less than 8, fill the remaining with Zero Addresses
  console.log({ otes: votes.value });
  const gaugeAddresses: string[] = Object.keys(votes.value);
  const weights: BigNumber[] = Object.values(votes.value).map(weight =>
    BigNumber.from(scale(weight || '0', 2).toString())
  );

  const zeroAddresses: string[] = new Array(8 - gaugeAddresses.length).fill(
    POOLS.ZeroAddress
  );
  const zeroWeights: BigNumber[] = new Array(8 - gaugeAddresses.length).fill(
    BigNumber.from(0)
  );
  console.log({
    zeroAddresses,
    zeroWeights,
  });
  try {
    voteState.setInit();
    const tx = await gaugeControllerService.voteForManyGaugeWeights(
      [...gaugeAddresses, ...zeroAddresses],
      [...weights, ...zeroWeights]
    );

    voteState.setConfirming();
    handleTransaction(tx);
  } catch (e: any) {
    const error = e as WalletError;
    console.error({ error });
    voteState.setError({
      title: 'Vote failed',
      description: error.message,
    });
  }
}

function getTransactionSummaryMsg(): string {
  const gauges = visibleVotingGauges.value;
  const message = gauges.reduce<string>((acc, gauge, i) => {
    return (
      acc +
      t('veBAL.liquidityMining.popover.voteForGauge', [
        fNum2(bpsToPct(votes.value[gauge.address]), FNumFormats.percent),
        gauge.pool.symbol,
      ]) +
      (i < gauges.length - 1 ? ', ' : '')
    );
  }, '');
  return message;
}

async function handleTransaction(tx) {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'voteForGauge',
    summary: getTransactionSummaryMsg(),
  });

  txListener(tx, {
    onTxConfirmed: async (receipt: TransactionReceipt) => {
      const confirmedAt = dateTimeLabelFor(await getTxConfirmedAt(receipt));

      voteState.setSuccess({ receipt, confirmedAt });
      refetchVotingGauges.value();
    },
    onTxFailed: () => {
      console.error('Vote failed');
      voteState.setError({
        title: 'Vote Failed',
        description: 'Vote failed for an unknown reason',
      });
    },
  });
}

watchEffect(() => {
  visibleVotingGauges.value.forEach(gauge => {
    votes.value[gauge.address] = gauge.userVotes
      ? bpsToPct(gauge.userVotes)
      : '0';
  });
});
</script>

<template>
  <BalModal show @close="emit('close')">
    <template #header>
      <div class="flex items-center">
        <h4>
          {{ t('veBAL.liquidityMining.resubmit.modal.title') }}
        </h4>
      </div>
    </template>
    <div>
      <BalAlert
        v-if="hasMoreThan8VotingGauges"
        class="mb-4"
        type="warning"
        :title="t('veBAL.liquidityMining.resubmit.modal.warning.title')"
        :description="
          t('veBAL.liquidityMining.resubmit.modal.warning.description')
        "
      >
      </BalAlert>
      <BalAlert
        v-if="voteState.error.value"
        type="error"
        :title="voteState.error.value.title"
        :description="voteState.error.value.description"
        block
        class="mt-2 mb-4"
      />
      <VoteInput
        v-for="gauge in visibleVotingGauges"
        :key="gauge.address"
        v-model="votes[gauge.address]"
        :gauge="gauge"
        :disabled="transactionInProgress"
      ></VoteInput>

      <div
        v-if="hiddenVotesTotalAllocation"
        class="flex justify-between p-4 mt-3 total-allocation"
      >
        <div>
          {{
            t(
              'veBAL.liquidityMining.resubmit.modal.otherPools',
              hiddenVotingGauges.length
            )
          }}
        </div>
        <div>{{ hiddenVotesTotalAllocation }}%</div>
      </div>

      <div :class="totalAllocationClass">
        <div class="p-4">
          {{ t('veBAL.liquidityMining.resubmit.modal.total') }}
        </div>
        <div class="p-4 border-l border-gray-200 dark:border-gray-900">
          {{ allGaugesTotalAllocation }}%
        </div>
      </div>

      <div v-if="voteButtonDisabled" class="mt-3 text-sm text-red-500">
        {{ t('veBAL.liquidityMining.resubmit.modal.exceeding') }}
      </div>

      <SubmitVoteBtn
        :disabled="voteButtonDisabled"
        :loading="transactionInProgress"
        class="mt-4"
        :loadingLabel="
          voteState.state.value === State.IDLE
            ? $t('veBAL.liquidityMining.popover.actions.vote.loadingLabel')
            : $t('veBAL.liquidityMining.popover.actions.vote.confirming')
        "
        @click:close="emit('close')"
        @click:submit="submitVote"
      >
        {{ t('veBAL.liquidityMining.resubmit.modal.confirm') }}
      </SubmitVoteBtn>
    </div>
  </BalModal>
</template>
  
  <style lang="css" scoped>
.total-allocation {
  @apply bg-gray-50 dark:bg-gray-800  border border-gray-200 dark:border-0 rounded-lg;
}

.total-allocation-disabled {
  @apply bg-red-600 dark:bg-red-600 text-white;
}
</style>
  