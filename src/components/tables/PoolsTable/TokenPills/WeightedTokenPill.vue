<script setup lang="ts">
import { PoolToken } from '@/services/pool/types';
import BalanceTooltip from './BalanceTooltip.vue';

type Props = {
  hasBalance: boolean;
  symbol: string;
  weight: string;
  isSelected: boolean;
  isPicked: boolean;
  token: PoolToken;
  isOnMigrationCard?: boolean;
  isHovered?: boolean;
};

withDefaults(defineProps<Props>(), {
  hasBalance: false,
  isSelected: false,
  isPicked: false,
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
            'pill-picked': isPicked,
            'pill-hoverable': hasBalance,
            'pill-migration': isOnMigrationCard,
            'pill-hovered': isHovered,
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
        <span
          v-if="weight !== '0%'"
          :class="[
            'pill-weight',
            {
              'pill-weight-migration': isOnMigrationCard,
            },
          ]"
        >
          {{ weight }}
        </span>
      </div>
    </template>
    <BalanceTooltip :token="token" :symbol="symbol" />
  </BalTooltip>
</template>

<style scoped>
.pill {
  @apply flex items-center px-2 my-1 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 relative max-h-10 items-center;
}

.pill-migration {
  @apply cursor-pointer;

  background-color: rgb(31 41 55 / 60%);
}

.pill-hovered {
  @apply bg-gray-600;
}

.pill-selected {
  @apply ring-2 ring-blue-500 dark:ring-blue-400;
}

.pill-picked {
  @apply bg-blue-50 dark:bg-blue-500 dark:bg-opacity-20;
}

.pill-weight {
  @apply font-medium text-gray-600 dark:text-gray-400 text-xs  mt-px ml-1;
}

.pill-weight-migration {
  @apply text-gray-400;
}

.balance-indicator {
  @apply w-3 h-3;
  @apply rounded-full border-2 border-white dark:border-gray-850 group-hover:border-gray-50
    dark:group-hover:border-gray-800;
  @apply bg-green-200 dark:bg-green-500;
  @apply absolute top-0 right-0 -mt-1 -mr-1;
}

.pill-hoverable:hover,
.pill-hoverable:focus {
  @apply bg-gray-200 dark:bg-gray-900;
}
</style>
