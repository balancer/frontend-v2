<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';
import { FullPool } from '@/services/balancer/subgraph/types';
/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  fiatTotal: string;
  priceImpact: number;
  isLoadingPriceImpact?: boolean;
  highPriceImpact?: boolean;
};
/**
 * PROPS & EMITS
 */
withDefaults(defineProps<Props>(), {
  isLoadingPriceImpact: false,
  highPriceImpact: false
});
/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { currency } = useUserSettings();
</script>

<template>
  <div class="summary-table">
    <h6 class="p-2">
      {{ $t('summary') }}
    </h6>
    <div class="flex flex-col py-2">
      <div class="summary-table-row">
        <div class="summary-table-label">
          {{ $t('total') }}
        </div>
        <div class="summary-table-number">
          {{ fNum2(fiatTotal, FNumFormats.fiat) }}
          <BalTooltip
            :text="$t('tooltips.invest.total', [currency.toUpperCase()])"
            icon-size="sm"
            class="ml-2"
          />
        </div>
      </div>
      <div
        :class="[
          'summary-table-row',
          {
            'bg-red-50 dark:bg-red-500 text-red-500 dark:text-white': highPriceImpact
          }
        ]"
      >
        <div class="summary-table-label">
          {{ $t('priceImpact') }}
        </div>
        <div class="summary-table-number">
          <BalLoadingBlock v-if="isLoadingPriceImpact" class="h-6 w-10" />
          <template v-else>
            {{ fNum2(priceImpact, FNumFormats.percent) }}
            <BalTooltip
              :text="$t('tooltips.invest.priceImpact')"
              icon-size="sm"
              :icon-name="highPriceImpact ? 'alert-triangle' : 'info'"
              :icon-class="
                highPriceImpact
                  ? 'text-red-500 dark:text-white'
                  : 'text-gray-300'
              "
              width="72"
              class="ml-2"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-table {
  @apply border dark:border-gray-700 divide-y dark:divide-gray-700 rounded-lg mt-4;
}
.summary-table-row {
  @apply grid grid-cols-2 px-2 py-1;
}
.summary-table-label {
  @apply flex items-center;
}
.summary-table-number {
  @apply flex items-center justify-end;
}
</style>
