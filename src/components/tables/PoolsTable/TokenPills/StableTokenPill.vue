<script setup lang="ts">
import { PoolToken } from '@/services/pool/types';

import BalanceTooltip from './BalanceTooltip.vue';

type Props = {
  hasBalance: boolean;
  symbol: string;
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
    class="mr-1 last:mr-0 leading-normal cursor-pointer"
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
        <div
          :class="[
            'pill-text',
            {
              'font-medium': isSelected,
            },
          ]"
        >
          {{ symbol }}
        </div>
      </div>
    </template>
    <BalanceTooltip :token="token" :symbol="symbol" />
  </BalTooltip>
</template>

<style scoped>
.pill {
  @apply flex;
  @apply relative;
  @apply my-px;
  @apply h-full;
}

.pill::before {
  @apply w-full h-full;
  @apply absolute;
  @apply bg-gray-100 dark:bg-gray-700;

  content: '';
  transform: skew(-12deg);
}

.pill:first-child::before {
  border-radius: 4px 0 0 4px;
}

.pill:last-child::before {
  border-radius: 0 4px 4px 0;
}

.pill:only-child::before {
  border-radius: 4px;
}

.pill-text {
  @apply px-2 py-1;

  z-index: 1;
}

.pill-selected::before {
  @apply ring-2 ring-blue-500 dark:ring-blue-400;
}

.balance-indicator {
  @apply w-3 h-3;
  @apply rounded-full border-2 border-white dark:border-gray-850 group-hover:border-gray-50
    dark:group-hover:border-gray-800;
  @apply bg-green-200 dark:bg-green-500;
  @apply absolute top-0 right-0 -mt-1 -mr-2;
}

.pill-hoverable:hover::before,
.pill-hoverable:focus::before {
  @apply bg-gray-200 dark:bg-gray-900;
}
</style>
