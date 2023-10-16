<script setup lang="ts">
import { formatVoteSharesWith2Decimals } from '../voting-utils';

type Props = {
  message: string;
  shares: string | number;
  error?: boolean;
  withDecimals?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  error: false,
  withDecimals: false,
});
</script>

<template>
  <div
    class="p-2 mb-2 text-base font-semibold rounded-lg border"
    :class="
      props.error
        ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-900 text-black dark:text-white'
        : 'bg-gray-100 dark:bg-gray-800 border-gray-100 dark:border-gray-800'
    "
  >
    <div class="flex justify-between p-2">
      <div>
        {{ props.message }}
      </div>
      <div v-if="withDecimals">
        {{ formatVoteSharesWith2Decimals(props.shares.toString()) }} %
      </div>
      <div v-else>{{ props.shares }} %</div>
    </div>
  </div>
  <div v-if="error" class="mt-3 ml-2 text-sm text-red-500">
    Your votes can’t exceed 100%
  </div>
</template>