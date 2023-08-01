<script lang="ts" setup>
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { useI18n } from 'vue-i18n';
import useEthers from '@/composables/useEthers';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { dateTimeLabelFor } from '@/composables/useTime';
import useTransactions from '@/composables/useTransactions';
import { bnum, scale } from '@/lib/utils';
import { gaugeControllerService } from '@/services/contracts/gauge-controller.service';
import { Address, WalletError } from '@/types';
import useVotingEscrowLocks from '@/composables/useVotingEscrowLocks';
import useVotingPools from '@/composables/useVotingPools';
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
const { poolsUsingUnderUtilizedVotingPower } = useVotingEscrowLocks();
const { votingPools, refetch: refetchVotingPools } = useVotingPools();
const voteState = useActionState();
const { t } = useI18n();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { fNum } = useNumbers();

/**
 * STATE
 */
const votes = ref<Record<Address, string>>({});

/**
 * COMPUTED
 */

//  Can vote max 8 pools in one time
const visibleVotingPools = computed(() =>
  poolsUsingUnderUtilizedVotingPower.value.slice(0, 8)
);

// All other pools using under-utilized voting power are grouped separately
const hiddenVotingPools = computed(() =>
  poolsUsingUnderUtilizedVotingPower.value.slice(7)
);

const allPoolsTotalAllocation = computed<number>(() => {
  const underUtilizedGaugeAddresses =
    poolsUsingUnderUtilizedVotingPower.value.map(pool => pool.gauge.address);

  return votingPools.value.reduce<number>((total, pool) => {
    return !underUtilizedGaugeAddresses.includes(pool.gauge.address)
      ? total + Number(bpsToPct(pool.userVotes))
      : total + Number(votes.value[pool.address]);
  }, 0);
});

const hasMoreThan8VotingGauges = computed(
  () => poolsUsingUnderUtilizedVotingPower.value.length > 8
);

const hiddenVotesTotalAllocation = computed<number>(() => {
  const totalUnscaled = hiddenVotingPools.value.reduce<number>(
    (total, gauge) => total + Number(gauge.userVotes),
    0
  );
  return Number(bpsToPct(totalUnscaled));
});

const voteButtonDisabled = computed<boolean>(
  () => allPoolsTotalAllocation.value > 100
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
  const pools = visibleVotingPools.value;
  const message = pools.reduce<string>((acc, pool, i) => {
    return (
      acc +
      t('veBAL.liquidityMining.popover.voteForGauge', [
        fNum(bpsToPct(votes.value[pool.gauge.address]), FNumFormats.percent),
        pool.symbol,
      ]) +
      (i < pools.length - 1 ? ', ' : '')
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
      refetchVotingPools();
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
  visibleVotingPools.value.forEach(pool => {
    votes.value[pool.gauge.address] = pool.userVotes
      ? bpsToPct(pool.userVotes)
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
        v-for="pool in visibleVotingPools"
        :key="pool.gauge.address"
        v-model="votes[pool.gauge.address]"
        :pool="pool"
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
              hiddenVotingPools.length
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
          {{ allPoolsTotalAllocation }}%
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
