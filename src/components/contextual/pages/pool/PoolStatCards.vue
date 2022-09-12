<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import APRTooltip from '@/components/tooltips/APRTooltip/APRTooltip.vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { totalAprLabel } from '@/composables/usePool';
import { APR_THRESHOLD } from '@/constants/pools';
import { Pool, PoolAPRs } from '@/services/pool/types';

/**
 * TYPES
 */
type Props = {
  pool?: Pool | null;
  poolApr?: PoolAPRs | null;
  loading?: boolean;
  loadingApr?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pool: null,
  poolApr: null,
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
  const poolAPRs = props.poolApr;
  if (!poolAPRs) return '0';

  return totalAprLabel(poolAPRs, props.pool?.boost);
});

const stats = computed(() => {
  if (!props.pool) return [];

  return [
    {
      id: 'poolValue',
      label: t('poolValue'),
      value: fNum2(props.pool.totalLiquidity, FNumFormats.fiat),
      loading: props.loading,
    },
    {
      id: 'volumeTime',
      label: t('volumeTime', ['24h']),
      value: fNum2(props.pool.volumeSnapshot || '0', FNumFormats.fiat),
      loading: props.loading,
    },
    {
      id: 'feesTime',
      label: t('feesTime', ['24h']),
      value: fNum2(props.pool.feesSnapshot || '0', FNumFormats.fiat),
      loading: props.loading,
    },
    {
      id: 'apr',
      label: 'APR',
      value:
        Number(props.poolApr?.total.unstaked || '0') * 100 > APR_THRESHOLD
          ? '-'
          : aprLabel.value,
      loading: props.loadingApr,
    },
  ];
});
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <template v-for="stat in stats" :key="stat.id">
      <BalLoadingBlock v-if="stat.loading || !pool" class="h-24" />
      <BalCard v-else>
        <div class="flex mb-2 text-sm font-medium text-secondary">
          <span>{{ stat.label }}</span>
          <APRTooltip
            v-if="stat.id === 'apr' && poolApr"
            :pool="pool"
            :poolApr="poolApr"
          />
        </div>
        <div class="flex items-center text-xl font-medium">
          {{ stat.value }}
        </div>
      </BalCard>
    </template>
  </div>
</template>
