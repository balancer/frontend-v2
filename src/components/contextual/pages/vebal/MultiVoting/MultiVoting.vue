<script setup lang="ts">
import VotingLayout from '@/components/layouts/VotingLayout.vue';
import VoteInputList from './VoteInputList.vue';
import VotingSubmission from './VotingSubmission.vue';
import { useVotingTransactionState } from './composables/useVotingTransactionState';
import { voteLockedUntilText } from '../voting-utils';
import { useVoting } from '../providers/voting.provider';

const { isSubmissionStep } = useVoting();
const { txState, resetTxState } = useVotingTransactionState();

const headerLabel = computed(() =>
  txState.confirmed ? 'Your votes were registered 🎉' : 'Pool gauge voting'
);

onUnmounted(() => resetTxState());
</script>

<template>
  <div>
    <VotingLayout :isOneColumn="txState.confirmed">
      <!-- Left column is hidden after the voting is successful  -->
      <template v-if="!txState.confirmed" #left>
        <BalCard noPad shadow="none">
          <div class="p-3 w-full">
            <h6>How it works</h6>
          </div>
          <div class="p-3 -mt-2">
            Your vote directs liquidity mining emissions for the future periods
            starting next Thursday at 0:00 UTC. Voting power is set at the time
            of a vote. If you get more veBAL later, resubmit your vote to use
            your increased power. Votes are timelocked for 10 days. If you vote
            now, no edits can be made until {{ voteLockedUntilText() }}.
          </div>
        </BalCard>
      </template>
      <template #right>
        <BalCard class="relative card-container" shadow="xl" noBorder>
          <template #header>
            <div class="flex justify-between items-center w-full">
              <div class="flex items-center">
                <BalCircle
                  v-if="txState.confirmed"
                  size="8"
                  color="green"
                  class="mr-2 text-white"
                >
                  <BalIcon name="check" />
                </BalCircle>
                <h4>{{ headerLabel }}</h4>
              </div>
            </div>
          </template>
          <VoteInputList v-if="!isSubmissionStep" />
          <Transition v-else name="appear" appear>
            <VotingSubmission />
          </Transition>
        </BalCard>
      </template>
    </VotingLayout>
  </div>
</template>
