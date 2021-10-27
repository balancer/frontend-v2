<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { WithdrawMathResponse } from '../composables/useWithdrawMath';
import useNumbers from '@/composables/useNumbers';

/**
 * TYPES
 */
type Props = {
  math: WithdrawMathResponse;
};

/**
 * Props
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();

const { priceImpact, highPriceImpact } = toRefs(props.math);

/**
 * COMPUTED
 */
const priceImpactClasses = computed(() => ({
  'bg-red-500 text-white divide-red-400 border-none': highPriceImpact.value
}));
</script>

<template>
  <div class="data-table">
    <div :class="['data-table-row', priceImpactClasses]">
      <div class="p-2">{{ $t('priceImpact') }}</div>
      <div class="data-table-number-col">
        <div>
          {{ fNum(priceImpact, 'percent') }}

          <BalTooltip :text="$t('withdraw.tooltips.priceImpact')">
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
  @apply dark:bg-gray-800;
}

.data-table-number-col {
  @apply p-2 flex flex-grow items-center justify-between;
}

.total-row {
  @apply text-lg font-bold;
}
</style>
