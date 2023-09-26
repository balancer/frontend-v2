
<script setup lang="ts">
import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import { useVotingWarnings } from './composables/useVotingWarnings';

type Props = {
  pool: VotingPool;
};

const props = defineProps<Props>();
const { timeLockedVoteWarning } = useVotingWarnings(props.pool);
</script>
<template>
  <BalTooltip v-if="timeLockedVoteWarning" textAlign="left">
    <template #activator>
      <TimelockIcon />
    </template>
    <div>
      <span class="font-semibold">
        {{ timeLockedVoteWarning.title }}
      </span>
      <p class="text-gray-500">
        {{ timeLockedVoteWarning.description }}
      </p>
    </div>
  </BalTooltip>
</template>