<script setup lang="ts">
/**
 * Shows a read-only list of votes once the user has clicked "Next" after filling the Vote Inputs
 */
import VotingActions from '@/components/contextual/pages/vebal/MultiVoting/VotingActions.vue';
import VoteAllocation from './VoteAllocation.vue';
import ConfirmedVote from './ConfirmedVote.vue';
import { useVoting } from '../providers/voting.provider';

const {
  unlockedSelectedPools,
  totalAllocatedWeight,
  expiredGauges,
  confirmedVotingRequest,
  shouldBatchVotes,
} = useVoting();
</script>

<template>
  <div>
    <BalAlert
      v-if="shouldBatchVotes"
      type="tip"
      class="mb-3"
      title="Your votes have been batched"
      description="The protocol only supports up to 8 votes per transaction, so additional votes will be confirmed afterwards."
    />

    <ConfirmedVote
      v-for="pool in unlockedSelectedPools"
      :key="pool.gauge.address"
      :pool="pool"
    />

    <VoteAllocation
      message="Total vote allocation"
      :shares="totalAllocatedWeight"
      withDecimals
    ></VoteAllocation>

    <VotingActions
      :request="confirmedVotingRequest"
      :expiredGauges="expiredGauges"
    />
  </div>
</template>
