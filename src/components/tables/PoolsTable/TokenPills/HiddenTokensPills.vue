<script setup lang="ts">
import { withDefaults, defineProps } from 'vue';

import { PoolToken } from '@/services/balancer/subgraph/types';

type Props = {
  tokens: PoolToken[];
  hasBalance: boolean;
  isSelected: boolean;
};

withDefaults(defineProps<Props>(), {
  hasBalance: false,
  isSelected: false
});
</script>

<template>
  <div class="relative flex mr-2 my-1">
    <div
      :class="[
        'pill',
        {
          'pill-selected': isSelected
        }
      ]"
      :style="{ zIndex: tokens.length }"
    >
      {{ $t('tokenPills.hiddenTokens', [tokens.length]) }}
    </div>
    <div
      v-if="hasBalance"
      class="balance-indicator"
      :style="{ zIndex: tokens.length }"
    />
    <div
      v-for="n in 2"
      :key="n"
      :class="[
        'pill pill-stacked',
        {
          'pill-selected': isSelected
        }
      ]"
      :style="{
        transform: `translateX(${n * 8}px)`,
        zIndex: tokens.length - n
      }"
    />
  </div>
</template>

<style scoped>
.pill {
  @apply px-2 py-1;
  @apply rounded-lg;
  @apply bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400;
  @apply text-sm;
  @apply flex items-center;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.07);
}

.pill-selected {
  @apply bg-blue-600 dark:bg-blue-600;
  @apply text-white dark:text-white;
}

.pill-stacked {
  @apply h-full w-full;
  @apply absolute top-0 left-0;
  box-shadow: 2px 0px 4px rgba(0, 0, 0, 0.07);
}

.balance-indicator {
  @apply w-3 h-3;
  @apply rounded-full border-2 border-white dark:border-gray-850;
  @apply bg-green-200 dark:bg-green-500;
  @apply absolute top-0 right-0 -mt-1 -mr-1;
}
</style>
