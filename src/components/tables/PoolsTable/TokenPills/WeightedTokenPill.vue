<script setup lang="ts">
import { PoolToken } from '@/services/pool/types';

import BalanceTooltip from './BalanceTooltip.vue';

type Props = {
  hasBalance: boolean;
  symbol: string;
  weight: string;
  isSelected: boolean;
  token: PoolToken;
};

withDefaults(defineProps<Props>(), {
  hasBalance: false,
  isSelected: false,
});
</script>

<template>
  <BalTooltip
    :disabled="!hasBalance"
    class="mr-2 last:mr-0 leading-normal cursor-pointer"
    textAlign="left"
    :delayMs="50"
  >
    <template #activator>
      <div
        :class="[
          'pill',
          {
            'pill-selected': isSelected,
            'pill-hoverable': hasBalance,
          },
        ]"
      >
        <div v-if="hasBalance" class="balance-indicator" />
        <span
          :class="[
            {
              'font-medium': isSelected,
            },
          ]"
        >
          {{ symbol }}
        </span>
        <span class="pill-weight">
          {{ weight }}
        </span>
      </div>
    </template>
    <BalanceTooltip :token="token" :symbol="symbol" />
  </BalTooltip>
</template>

<style scoped>
.pill {
  @apply flex items-center px-2 my-1 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 relative h-full;
}

.pill-selected {
  @apply ring-2 ring-blue-500 dark:ring-blue-400;
}

.pill-weight {
  @apply font-medium text-gray-600 dark:text-gray-400 text-xs;
  @apply mt-px ml-1;
}

.balance-indicator {
  @apply w-3 h-3;
  @apply rounded-full border-2 border-white dark:border-gray-850 group-hover:border-gray-50
    dark:group-hover:border-gray-800;
  @apply bg-green-400 dark:bg-green-500;
  @apply absolute top-0 right-0 -mt-1 -mr-1;
}

.pill-hoverable:hover,
.pill-hoverable:focus {
  @apply bg-gray-200 dark:bg-gray-900;
}
</style>
