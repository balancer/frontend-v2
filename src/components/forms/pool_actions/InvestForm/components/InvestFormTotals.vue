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
  optimized: boolean;
};

/**
 * Props
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'maximize'): void;
  (e: 'optimize'): void;
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

const optimizeBtnClasses = computed(() => ({
  'text-gradient': !props.highPriceImpact,
  'text-red-500 px-2 py-1 bg-white rounded-lg': props.highPriceImpact
}));
</script>

<template>
  <div class="data-table">
    <div class="data-table-row total-row">
      <div class="p-2">{{ $t('total') }}</div>
      <div class="data-table-number-col">
        {{ fNum(total, 'usd') }}
        <div class="text-sm">
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
        <div>
          {{ fNum(priceImpact, 'percent') }}

          <BalTooltip>
            <template v-slot:activator>
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
                class="text-gray-400 -mb-px ml-1"
              />
            </template>
            <div v-html="$t('customAmountsTip')" class="text-black w-52" />
          </BalTooltip>
        </div>

        <div class="text-sm font-semibold">
          <span v-if="optimized" class="text-gray-400 dark:text-gray-600">
            {{ $t('optimized') }}
          </span>
          <div
            v-else
            :class="['cursor-pointer', optimizeBtnClasses]"
            @click="emit('optimize')"
          >
            {{ $t('optimize') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-table {
  @apply border dark:border-gray-700 rounded-lg divide-y dark:divide-gray-700;
}

.data-table-row {
  @apply grid grid-cols-4 divide-x dark:divide-gray-700 flex items-center;
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
