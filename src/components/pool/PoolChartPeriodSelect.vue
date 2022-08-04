<script setup lang="ts">
import { PoolChartPeriod } from '@/components/contextual/pages/pool/PoolChart.vue';

/**
 * TYPES
 */
type Props = {
  options: PoolChartPeriod[];
  activeOption: PoolChartPeriod;
};

const emit = defineEmits<{
  (e: 'change-option', value: PoolChartPeriod): void;
}>();

/**
 * PROPS
 */
defineProps<Props>();
</script>

<template>
  <BalPopover noPad>
    <template #activator>
      <div class="h-10 text-base period-select-input">
        <div class="flex flex-1 justify-between items-center h-full">
          <div class="period-select-input__selected">
            {{ activeOption.text }}
          </div>
          <BalIcon name="chevron-down" />
        </div>
      </div>
    </template>
    <template #default="{ close }">
      <div class="flex overflow-hidden flex-col w-44 rounded-lg" @click="close">
        <div
          class="py-2 px-3 text-sm font-medium text-gray-500 whitespace-nowrap bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-900"
        >
          {{ $t('poolChart.period.title') }}:
        </div>
        <div
          v-for="option in options"
          :key="option.days"
          class="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
          @click="emit('change-option', option)"
        >
          <div class="flex items-center ml-1 font-medium">
            {{ option.text }}
          </div>
          <BalIcon
            v-if="activeOption.days === option.days"
            name="check"
            class="text-blue-500"
          />
        </div>
      </div>
    </template>
  </BalPopover>
</template>

<style scoped>
.period-select-input {
  @apply relative w-28 rounded-lg shadow hover:shadow-none focus:shadow-none overflow-hidden px-2
    bg-gray-50 dark:bg-gray-800 transition-all;
}

.period-select-input__selected {
  @apply flex items-center font-semibold h-full leading-loose bg-transparent leading-none -ml-px text-xs;

  appearance: none;
  text-indent: 1px;
  text-overflow: '';
}

.period-select-input .bal-icon :deep(svg) {
  @apply transition-all;

  stroke: theme('colors.blue.500');
}

.period-select-input:hover .bal-icon :deep(svg),
.period-select-input:focus .bal-icon :deep(svg) {
  stroke: theme('colors.pink.500');
}
</style>
