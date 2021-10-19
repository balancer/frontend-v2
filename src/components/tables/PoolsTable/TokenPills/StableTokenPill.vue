<script setup lang="ts">
import { defineProps, withDefaults } from 'vue';

type Props = {
  hasBalance: boolean;
  symbol: string;
  isSelected: boolean;
};

withDefaults(defineProps<Props>(), {
  hasBalance: false,
  isSelected: false
});
</script>

<template>
  <div
    :class="[
      'pill',
      {
        'pill-selected': isSelected
      }
    ]"
  >
    <div v-if="hasBalance" class="balance-indicator" />
    <div class="pill-text">
      {{ symbol }}
    </div>
  </div>
</template>

<style scoped>
.pill {
  @apply flex;
  @apply relative;
  @apply mr-1;
}
.pill:last-child {
  @apply mr-0;
}

.pill::before {
  @apply w-full h-full;
  @apply absolute;
  @apply bg-gray-100 dark:bg-gray-700;
  content: '';
  transform: skew(-12deg);
}

.pill:first-child::before {
  border-radius: 4px 0px 0px 4px;
}

.pill:last-child::before {
  border-radius: 0px 4px 4px 0px;
}

.pill-text {
  @apply px-2 py-1;
  z-index: 1;
}

.pill-selected::before {
  @apply bg-blue-600 dark:bg-blue-600;
}

.pill-selected .pill-text {
  @apply text-white;
}

.balance-indicator {
  @apply w-3 h-3;
  @apply rounded-full border-2 border-white dark:border-gray-850 group-hover:border-gray-50 dark:group-hover:border-gray-800;
  @apply bg-green-200 dark:bg-green-500;
  @apply absolute top-0 right-0 -mt-1 -mr-1;
}
</style>
