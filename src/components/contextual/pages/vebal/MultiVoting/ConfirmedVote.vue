<script setup lang="ts">
import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import VotePoolDetails from './VotePoolDetails.vue';
import VotePoolFooter from './VotePoolFooter.vue';
import { useVoting } from '../providers/voting.provider';
import { formatVoteSharesWith2Decimals } from '../voting-utils';

type Props = {
  pool: VotingPool;
};
defineProps<Props>();

const { votingRequest } = useVoting();
</script>

<template>
  <div
    class="p-1 mb-2 text-base dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-800 shadow-inner"
  >
    <div class="flex justify-between">
      <VotePoolDetails :pool="pool"></VotePoolDetails>
      <div class="mt-2">
        <div class="flex items-center pr-4 h-full font-semibold">
          <span class="text-xl text-black dark:text-white">
            {{
              formatVoteSharesWith2Decimals(votingRequest[pool.gauge.address])
            }}
            %
          </span>
        </div>
      </div>
    </div>

    <VotePoolFooter :pool="pool"></VotePoolFooter>
  </div>
</template>