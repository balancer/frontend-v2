<script setup lang="ts">
import { useVoting } from '../providers/voting.provider';
import VoteAllocation from './VoteAllocation.vue';
import VoteInput from './VoteInput.vue';

const {
  selectedPools,
  votingRequest,
  hasExpiredPoolsSelected,
  hasTimeLockedPools,
  totalAllocatedWeight,
  isVotingRequestValid,
  isRequestingTooMuchWeight,
  isInputDisabled,
  goToSubmissionStep,
} = useVoting();
</script>

<template>
  <div>
    <BalAlert
      v-if="hasTimeLockedPools"
      type="tip"
      class="mb-3"
      title="You have a timelocked pool gauge"
      description="You are not able to edit the votes on any pool gauge that you voted on within the last 10 days."
    />

    <BalAlert
      v-if="hasExpiredPoolsSelected"
      type="tip"
      class="mb-3"
      title="You have an expired pool"
      description="Votes for expired pools must be removed. Select other pools from the veBAL page to reallocate these votes."
    />

    <VoteInput
      v-for="(pool, i) in selectedPools"
      :key="pool.gauge.address"
      v-model="votingRequest[pool.gauge.address]"
      :pool="pool"
      :disabled="isInputDisabled(pool)"
      :autoFocus="i === 0"
    />

    <VoteAllocation
      message="Total vote allocation"
      :shares="totalAllocatedWeight"
      :error="isRequestingTooMuchWeight"
    ></VoteAllocation>

    <BalBtn
      class="mt-3"
      size="md"
      label="Next"
      color="gradient"
      :disabled="!isVotingRequestValid"
      block
      @click="goToSubmissionStep"
    />
  </div>
</template>
