<script setup lang="ts">
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';

import useExitPool from '@/composables/pools/useExitPool';

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();

const { priceImpact, highPriceImpact, isLoadingQuery } = useExitPool();

/**
 * COMPUTED
 */
const priceImpactClasses = computed(() => ({
  'bg-red-500 dark:bg-red-500 text-white divide-red-400 border-none':
    highPriceImpact.value,
}));
</script>

<template>
  <div class="data-table">
    <div :class="['data-table-row', priceImpactClasses, 'dark:bg-gray-800']">
      <div class="p-2">
        {{ $t('priceImpact') }}
      </div>
      <div class="data-table-number-col">
        <div class="flex items-center">
          <BalLoadingBlock v-if="isLoadingQuery" class="w-10 h-6" />
          <span v-else>{{ fNum2(priceImpact, FNumFormats.percent) }}</span>

          <BalTooltip :text="$t('withdraw.tooltips.priceImpact')">
            <template #activator>
              <BalIcon
                v-if="highPriceImpact"
                name="alert-triangle"
                size="xs"
                class="-mb-px ml-1"
              />
              <BalIcon
                v-else
                name="info"
                size="xs"
                class="-mb-px ml-1 text-gray-400"
              />
            </template>
          </BalTooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-table {
  @apply rounded-lg divide-y dark:divide-gray-700;
}

.data-table-row {
  @apply flex;
  @apply rounded-lg;
  @apply divide-x dark:divide-gray-900 border dark:border-gray-900;
}

.data-table-number-col {
  @apply p-2 flex flex-grow items-center justify-between;
}

.total-row {
  @apply text-lg font-semibold;
}
</style>
