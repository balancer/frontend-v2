<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <template v-if="loading">
      <BalLoadingBlock v-for="n in 4" :key="n" class="h-24" />
    </template>
    <template v-else>
      <BalCard v-for="(stat, i) in stats" :key="i">
        <div class="text-sm text-gray-500 font-medium mb-2 flex">
          <span>{{ stat.label }}</span>
          <LiquidityAPRTooltip :pool="pool" v-if="stat.id === 'apr'" />
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ stat.value }}
        </div>
      </BalCard>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import LiquidityAPRTooltip from '@/components/tooltips/LiquidityAPRTooltip.vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { APR_THRESHOLD } from '@/constants/poolAPR';
import { bnum } from '@/lib/utils';
import { DecoratedPool } from '@/services/balancer/subgraph/types';
import {
  getAprRangeWithRewardEmissions,
  hasBALEmissions,
  hasStakingRewards
} from '@/services/staking/utils';

export default defineComponent({
  components: {
    LiquidityAPRTooltip
  },

  props: {
    pool: { type: Object as PropType<DecoratedPool> },
    loading: { type: Boolean, default: true }
  },

  setup(props) {
    // COMPOSABLES
    const { fNum2 } = useNumbers();
    const { t } = useI18n();

    const aprValueToRender = computed(() => {
      if (hasStakingRewards(props.pool)) {
        // cannot show a range if there are no bal emissions
        if (!hasBALEmissions(props.pool)) {
          return fNum2(
            bnum(props.pool?.dynamic.apr.staking?.Rewards || '0')
              .plus(props.pool?.dynamic.apr.total || '0')
              .toString(),
            FNumFormats.percent
          );
        }
        // show a range if there are bal emissions, min and max
        // are adjusted to show rewards emissions apr included
        return `${fNum2(
          getAprRange(props.pool).min,
          FNumFormats.percent
        )} - ${fNum2(getAprRange(props.pool).max, FNumFormats.percent)}`;
      }
      return fNum2(props.pool?.dynamic?.apr?.total || '0', FNumFormats.percent);
    });

    // COMPUTED
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
          value: fNum2(props.pool.dynamic.volume, FNumFormats.fiat)
        },
        {
          id: 'feesTime',
          label: t('feesTime', ['24h']),
          value: fNum2(props.pool.dynamic.fees, FNumFormats.fiat)
        },
        {
          id: 'apr',
          label: 'APR',
          value:
            Number(props.pool.dynamic.apr.total) > APR_THRESHOLD
              ? '-'
              : aprValueToRender.value
        }
      ];
    });

    function getAprRange(pool: DecoratedPool | undefined) {
      if (!pool) return { min: '0', max: '0' };
      const adjustedRange = getAprRangeWithRewardEmissions(pool);
      return adjustedRange;
    }

    return {
      stats
    };
  }
});
</script>
