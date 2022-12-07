<script setup lang="ts">
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';

/**
 * TYPES
 */
type Props = {
  highPriceImpact: boolean;
  loading: boolean;
  priceImpact: number;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */
const priceImpactClasses = computed(() => ({
  'dark:bg-gray-800': !props.highPriceImpact,
  'bg-red-500 dark:bg-red-500 text-white divide-red-400': props.highPriceImpact,
}));
</script>

<template>
  <div class="data-table">
    <div :class="['data-table-row price-impact-row', priceImpactClasses]">
      <div class="p-2">
        {{ $t('priceImpact') }}
      </div>
      <div class="data-table-number-col">
        <div class="flex">
          <span v-if="!loading">
            {{ fNum2(priceImpact, FNumFormats.percent) }}
          </span>
          <BalLoadingBlock v-else class="w-10" />

          <BalTooltip :text="$t('customAmountsTip')">
            <template #activator>
              <BalIcon
                v-if="highPriceImpact"
                data-testid="price-impact-warning-icon"
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
  @apply border dark:border-gray-900 rounded-lg divide-y dark:divide-gray-900;
}

.data-table-row {
  @apply grid grid-cols-4 items-center;
  @apply divide-x dark:divide-gray-900;
}

.data-table-row:first-child {
  @apply rounded-t-lg;
}

.data-table-number-col {
  @apply col-span-3 p-2 flex items-center justify-between;
}

.total-row {
  @apply text-lg font-bold dark:bg-gray-800;
}

.price-impact-row {
  @apply text-sm rounded-b-lg;
}
</style>
