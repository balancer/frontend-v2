<script lang="ts" setup>
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { format, formatDistanceToNow } from 'date-fns';
import { computed, onMounted, reactive, ref, watchEffect } from 'vue';
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
const { poolsUsingUnderUtilizedVotingPower } = useVotingEscrowLocks();
const { votingGauges: allVotingGauges } = useVotingGauges();

/**
 * STATE
 */
const votes = ref<Record<Address, string>>({});

/**
 * COMPUTED
 */
const votingGauges = computed(() =>
  allVotingGauges.value.filter(gauge => {
    return poolsUsingUnderUtilizedVotingPower.value.includes(gauge.address);
  })
);

const totalVotes = computed<number>(() =>
  Object.values(votes.value).reduce<number>(
    (total, value) => total + Number(value),
    0
  )
);
const disabled = computed<boolean>(() => totalVotes.value > 100);

/**
 * METHODS
 */
async function submitVote() {
  const gaugeAddresses = Object.keys(votes.value);
  const weights = Object.values(votes.value).map(weight =>
    scale(weight, 2).toString()
  );
  console.log({
    gaugeAddresses,
    weights,
  });
  try {
    // voteState.init = true;
    // voteState.error = null;
    const tx = await gaugeControllerService.voteForManyGaugeWeights(
      gaugeAddresses,
      weights.map(weight => BigNumber.from(weight))
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
  votingGauges.value.forEach(gauge => {
    votes.value[gauge.address] = gauge.userVotes
      ? scale(bnum(gauge.userVotes), -2).toString()
      : '';
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
      <GaugeItem
        v-for="gauge in votingGauges"
        :key="gauge.address"
        v-model="votes[gauge.address]"
        :gauge="gauge"
      ></GaugeItem>

      <div class="mt-4">
        <div
          :class="{
            'bg-red-600': disabled,
            'text-white': disabled,
          }"
        >
          Total vote allocation {{ totalVotes }}%
        </div>
        <div v-if="disabled" class="text-red-500">
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
    </div>
  </BalModal>
</template>
