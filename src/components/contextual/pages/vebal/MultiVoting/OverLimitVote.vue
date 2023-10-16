
<script setup lang="ts">
import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import { useVotingWarnings } from './composables/useVotingWarnings';

type Props = {
  pool: VotingPool;
};

const props = defineProps<Props>();
const { lpVoteOverLimitWarning } = useVotingWarnings(props.pool);
</script>
<template>
  <BalTooltip v-if="lpVoteOverLimitWarning" textAlign="left">
    <template #activator>
      <BalIcon class="ml-1" name="alert-triangle" size="sm" />
    </template>
    <div>
      <span class="font-semibold">
        {{ lpVoteOverLimitWarning.title }}
      </span>
      <p class="text-gray-500">
        {{ lpVoteOverLimitWarning.description }}
      </p>
    </div>
  </BalTooltip>
</template>