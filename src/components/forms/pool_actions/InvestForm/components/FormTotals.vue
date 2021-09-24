<script setup lang="ts">
import { computed } from 'vue';
import useNumbers from '@/composables/useNumbers';

/**
 * TYPES
 */
type Props = {
  total: string;
  priceImpact: number;
  highPriceImpact: boolean;
  maximized: boolean;
};

/**
 * Props
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'maximize'): void;
}>();

/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();

/**
 * COMPUTED
 */
const priceImpactClasses = computed(() => ({
  'bg-red-500 text-white divide-red-400': props.highPriceImpact
}));
</script>

<template>
  <div class="data-table">
    <div class="data-table-row total-row">
      <div class="p-2">{{ $t('total') }}</div>
      <div class="data-table-number-col">
        {{ fNum(total, 'usd') }}
        <div class="text-sm font-light p-1 pr-0">
          <span v-if="maximized" class="text-gray-400 dark:text-gray-600">
            {{ $t('maxed') }}
          </span>
          <span
            v-else
            class="text-blue-500 cursor-pointer"
            @click="emit('maximize')"
          >
            {{ $t('max') }}
          </span>
        </div>
      </div>
    </div>
    <div :class="['data-table-row price-impact-row', priceImpactClasses]">
      <div class="p-2">{{ $t('priceImpact') }}</div>
      <div class="data-table-number-col">
        {{ fNum(priceImpact, 'percent') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-table {
  @apply border rounded-lg divide-y;
}

.data-table-row {
  @apply grid grid-cols-4 divide-x;
}

.data-table-number-col {
  @apply col-span-3 p-2 flex items-center justify-between;
}

.total-row {
  @apply text-lg font-bold;
}

.price-impact-row {
  @apply text-sm rounded-b-lg;
}
</style>
