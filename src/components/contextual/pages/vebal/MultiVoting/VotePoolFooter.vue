<script lang="ts" setup>
import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';

type Props = {
  pool: VotingPool;
};
defineProps<Props>();
</script>

<template>
  <div
    class="flex items-center pl-16 mt-1 h-full text-sm text-gray-500 dark:text-gray-300"
  >
    {{ pool.symbol }}
  </div>
</template>