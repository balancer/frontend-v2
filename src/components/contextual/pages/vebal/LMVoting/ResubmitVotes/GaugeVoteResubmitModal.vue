<script lang="ts" setup>
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import OldBigNumber from 'bignumber.js';

import { format, formatDistanceToNow } from 'date-fns';
import { computed, onMounted, reactive, ref, toRef, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import BalForm from '@/components/_global/BalForm/BalForm.vue';
import BalTextInput from '@/components/_global/BalTextInput/BalTextInput.vue';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import useEthers from '@/composables/useEthers';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import {
  dateTimeLabelFor,
  toJsTimestamp,
  toUtcTime,
} from '@/composables/useTime';
import useTransactions from '@/composables/useTransactions';
import useVeBal from '@/composables/useVeBAL';
import { WEIGHT_VOTE_DELAY } from '@/constants/gauge-controller';
import { VEBAL_VOTING_GAUGE } from '@/constants/voting-gauges';
import { bnum, isSameAddress, scale } from '@/lib/utils';
import { isPositive } from '@/lib/utils/validations';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';
import { gaugeControllerService } from '@/services/contracts/gauge-controller.service';
import { Address, WalletError } from '@/types';
import { TransactionActionState } from '@/types/transactions';
import useVotingEscrowLocks from '@/composables/useVotingEscrowLocks';
import useVotingGauges from '@/composables/useVotingGauges';
import { orderedPoolTokens } from '@/composables/usePool';
import GaugeItem from './GaugeItem.vue';

/**
 * TYPES
 */

/**
 * PROPS & EMITS
 */

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

/**
 * COMPOSABLES
 */
const { gaugesUsingUnderUtilizedVotingPower } = useVotingEscrowLocks();
const { votingGauges } = useVotingGauges();

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

// All other gauges using under utilized voting power are grouped separately
const hiddenVotingGauges = computed(() =>
  gaugesUsingUnderUtilizedVotingPower.value.slice(7)
);

const allGaugesTotalAllocation = computed<number>(() => {
  const underUtilizedAddresses = gaugesUsingUnderUtilizedVotingPower.value.map(
    gauge => gauge.address
  );

  return votingGauges.value.reduce<number>((total, gauge) => {
    return !underUtilizedAddresses.includes(gauge.address)
      ? total + Number(scale(bnum(gauge.userVotes), -2).toString())
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
  return Number(scale(bnum(totalUnscaled), -2).toString());
});

const disabled = computed<boolean>(() => allGaugesTotalAllocation.value > 100);

const totalAllocationClass = computed(() => ({
  'total-allocation-disabled': disabled.value,
  'total-allocation mt-3 flex justify-between': true,
}));

/**
 * METHODS
 */
async function submitVote() {
  // Gauge Controller takes a fixed 8 Gauge Addresses
  // We take the first 8 Voting Gauges
  // If there's less than 8, fill the remaining with null address
  const gaugeAddresses: string[] = Object.keys(votes.value);
  const weights: BigNumber[] = Object.values(votes.value).map(weight =>
    BigNumber.from(scale(weight || '0', 2).toString())
  );
  console.log({ gaugeAddresses });
  const zeroAddresses: string[] = new Array(8 - gaugeAddresses.length).fill(
    '0x0000000000000000000000000000000000000000'
  );
  const zeroWeights: BigNumber[] = new Array(8 - gaugeAddresses.length).fill(
    BigNumber.from(0)
  );

  console.log({
    gaugeAddresses,
    weights,
  });
  try {
    // voteState.init = true;
    // voteState.error = null;
    const tx = await gaugeControllerService.voteForManyGaugeWeights(
      [...gaugeAddresses, ...zeroAddresses],
      [...weights, ...zeroWeights]
    );
    console.log({ tx });
    // voteState.init = false;
    // voteState.confirming = true;
    // handleTransaction(tx);
  } catch (e) {
    console.error(e);
    const error = e as WalletError;
    console.error({ error });
    // voteState.init = false;
    // voteState.confirming = false;
    // voteState.error = {
    //   title: 'Vote failed',
    //   description: error.message,
    // };
  }
}

watchEffect(() => {
  console.log(visibleVotingGauges.value.length);
  visibleVotingGauges.value.forEach(gauge => {
    votes.value[gauge.address] = gauge.userVotes
      ? scale(bnum(gauge.userVotes), -2).toString()
      : '0';
  });
});

/**
 * LIFECYCLE
 */
</script>

<template>
  <BalModal show @close="emit('close')">
    <template #header>
      <div class="flex items-center">
        <h4>Preview vote resubmission</h4>
      </div>
    </template>
    <div>
      <BalAlert
        v-if="hasMoreThan8VotingGauges"
        class="mb-4"
        type="warning"
        title="You can only resubmit up to 8 votes"
        description="It’s only possible to update 8 pool gauge votes at a time.
          You’ll need to update your votes for the remaining ones manually."
      >
      </BalAlert>
      <GaugeItem
        v-for="gauge in visibleVotingGauges"
        :key="gauge.address"
        v-model="votes[gauge.address]"
        :gauge="gauge"
      ></GaugeItem>

      <div
        v-if="hiddenVotesTotalAllocation"
        class="flex justify-between p-4 mt-3 total-allocation"
      >
        <div>{{ hiddenVotingGauges.length }} other pools</div>
        <div>{{ hiddenVotesTotalAllocation }}%</div>
      </div>

      <div :class="totalAllocationClass">
        <div class="p-4">Total vote allocation</div>
        <div class="p-4 border-l border-gray-200 dark:border-gray-900">
          {{ allGaugesTotalAllocation }}%
        </div>
      </div>

      <div v-if="disabled" class="mt-3 text-sm text-red-500">
        Your votes can’t exceed 100%
      </div>
      <BalBtn
        class="mt-4"
        :disabled="disabled"
        color="gradient"
        block
        @click="submitVote"
      >
        Confirm votes
      </BalBtn>
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
  