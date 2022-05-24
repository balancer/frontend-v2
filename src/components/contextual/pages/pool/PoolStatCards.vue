<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import APRTooltip from '@/components/tooltips/APRTooltip/APRTooltip.vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { totalAprLabel } from '@/composables/usePool';
import { APR_THRESHOLD } from '@/constants/pools';
import { Pool } from '@/services/balancer/subgraph/types';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  loading?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  loading: false
});

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { t } = useI18n();

/**
 * COMPUTED
 */
const aprLabel = computed((): string => {
  const poolAPRs = props.pool?.apr;
  if (!poolAPRs) return '0';

  return totalAprLabel(poolAPRs, props.pool.boost);
});

const stats = computed(() => {
  if (!props.pool) return [];

  return [
    {
      id: 'poolValue',
      label: t('poolValue'),
      value: fNum2(props.pool.totalLiquidity, FNumFormats.fiat)
    },
    {
      id: 'volumeTime',
      label: t('volumeTime', ['24h']),
      value: fNum2(props.pool.volumeSnapshot || '0', FNumFormats.fiat)
    },
    {
      id: 'feesTime',
      label: t('feesTime', ['24h']),
      value: fNum2(props.pool.feesSnapshot || '0', FNumFormats.fiat)
    },
    {
      id: 'apr',
      label: 'APR',
      value:
        Number(props.pool?.apr?.total.unstaked || '0') * 100 > APR_THRESHOLD
          ? '-'
          : aprLabel.value
    }
  ];
});
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <template v-if="loading">
      <BalLoadingBlock v-for="n in 4" :key="n" class="h-24" />
    </template>
    <template v-else>
      <BalCard v-for="(stat, i) in stats" :key="i">
        <div class="text-sm text-gray-500 font-medium mb-2 flex">
          <span>{{ stat.label }}</span>
          <APRTooltip v-if="stat.id === 'apr'" :pool="pool" />
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ stat.value }}
        </div>
      </BalCard>
    </template>
  </div>
</template>
