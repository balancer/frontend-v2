<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { useUserSettings } from '@/providers/user-settings.provider';
import { Pool } from '@/services/pool/types';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  fiatTotal: string;
  priceImpact: number;
  isLoadingPriceImpact?: boolean;
  highPriceImpact?: boolean;
  summaryTitle?: string | undefined;
};

/**
 * PROPS & EMITS
 */
withDefaults(defineProps<Props>(), {
  isLoadingPriceImpact: false,
  highPriceImpact: false,
  summaryTitle: undefined,
});

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { currency } = useUserSettings();
</script>

<template>
  <BalDataList :title="$t('summary')">
    <BalDataListRow :label="$t('investment.preview.summary.total')">
      <template #value>
        {{ fNum2(fiatTotal, FNumFormats.fiat) }}
        <BalTooltip
          :text="$t('tooltips.addLiquidity.total', [currency.toUpperCase()])"
          iconSize="sm"
          class="ml-2"
        />
      </template>
    </BalDataListRow>
    <BalDataListRow
      :label="$t('priceImpact')"
      :class="{
        'bg-red-50 dark:bg-red-500 text-red-500 dark:text-white':
          highPriceImpact,
      }"
    >
      <template #value>
        <BalLoadingBlock v-if="isLoadingPriceImpact" class="w-10 h-6" />
        <template v-else>
          {{ fNum2(priceImpact, FNumFormats.percent) }}
          <BalTooltip
            :text="$t('tooltips.addLiquidity.priceImpact')"
            iconSize="sm"
            :iconName="highPriceImpact ? 'alert-triangle' : 'info'"
            :iconClass="
              highPriceImpact ? 'text-red-500 dark:text-white' : 'text-gray-300'
            "
            width="72"
            class="ml-2"
          />
        </template>
      </template>
    </BalDataListRow>
  </BalDataList>
</template>
