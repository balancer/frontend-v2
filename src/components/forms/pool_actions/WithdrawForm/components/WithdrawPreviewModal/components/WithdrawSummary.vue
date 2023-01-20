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
};

/**
 * PROPS & EMITS
 */
defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { currency } = useUserSettings();
</script>

<template>
  <BalDataList :title="$t('summary')">
    <BalDataListRow :label="$t('total')">
      <template #value>
        {{ fNum2(fiatTotal, FNumFormats.fiat) }}
        <BalTooltip
          :text="$t('tooltips.withdraw.total', [currency.toUpperCase()])"
          iconSize="sm"
          class="ml-2"
        />
      </template>
    </BalDataListRow>
    <BalDataListRow :label="$t('priceImpact')">
      <template #value>
        {{ fNum2(priceImpact, FNumFormats.percent) }}
        <BalTooltip
          :text="$t('tooltips.withdraw.priceImpact')"
          iconSize="sm"
          width="72"
          class="ml-2"
        />
      </template>
    </BalDataListRow>
  </BalDataList>
</template>
