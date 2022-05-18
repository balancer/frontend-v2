<script setup lang="ts">
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { APR_THRESHOLD } from '@/constants/poolAPR';
import { bnum } from '@/lib/utils';
import { DecoratedPool } from '@/services/balancer/subgraph/types';
import {
  getAprRangeWithRewardEmissions,
  getBoostAdjustedTotalAPR,
  hasBALEmissions,
  hasStakingRewards
} from '@/services/staking/utils';

import StakingBreakdown from './components/StakingBreakdown.vue';
import YieldBreakdown from './components/YieldBreakdown.vue';

/**
 * TYPES
 */
type Props = {
  pool: DecoratedPool;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */
const validAPR = computed(
  () => Number(props?.pool?.dynamic?.apr?.total || '0') * 100 <= APR_THRESHOLD
);

const hasYieldAPR = computed(() =>
  bnum(props?.pool?.dynamic?.apr?.yield.total || '0').gt(0)
);

const totalAPRRange = computed(() => {
  const adjustedRange = getAprRangeWithRewardEmissions(props?.pool);
  return adjustedRange;
});

/**
 * Total APR if has staking rewards but not BAL emissions
 */
const totalAPRRewardsOnly = computed((): string =>
  bnum(props.pool.dynamic?.apr.staking?.rewards || '0')
    .plus(props.pool.dynamic?.apr?.total || '0')
    .toString()
);

const totalAPRLabel = computed((): string => {
  if (props.pool.dynamic?.boost) {
    return fNum2(
      getBoostAdjustedTotalAPR(props.pool, props.pool.dynamic?.boost),
      FNumFormats.percent
    );
  } else if (hasStakingRewards(props.pool)) {
    if (hasBALEmissions(props.pool)) {
      return `${fNum2(totalAPRRange.value.min, FNumFormats.percent)} - ${fNum2(
        totalAPRRange.value.max,
        FNumFormats.percent
      )}`;
    } else {
      return fNum2(totalAPRRewardsOnly.value, FNumFormats.percent);
    }
  }
  return fNum2(props.pool.dynamic?.apr?.total, FNumFormats.percent);
});
</script>

<template v-slot:aprCell="pool">
  <BalTooltip width="auto" noPad v-if="validAPR">
    <template v-slot:activator>
      <div class="ml-1">
        <StarsIcon
          v-if="hasYieldAPR || hasStakingRewards(pool)"
          class="h-4 text-yellow-300 -mr-1"
          v-bind="$attrs"
        />
        <BalIcon
          v-else
          name="info"
          size="sm"
          class="text-gray-400 dark:text-gray-500"
          v-bind="$attrs"
        />
      </div>
    </template>
    <div class="text-sm divide-y dark:divide-gray-900">
      <div class="px-3 pt-3 pb-1 bg-gray-50 dark:bg-gray-800 rounded-t">
        <div class="text-gray-500">{{ $t('totalAPR') }}</div>
        <div>{{ totalAPRLabel }}</div>
      </div>
      <div class="p-3">
        <!-- SWAP FEE APR -->
        <div class="whitespace-nowrap flex items-center mb-1">
          {{ fNum2(pool.dynamic?.apr?.swap, FNumFormats.percent) }}
          <span class="ml-1 text-gray-500 text-xs">{{ $t('swapFeeAPR') }}</span>
        </div>

        <!-- YIELD APR BREAKDOWN -->
        <YieldBreakdown
          v-if="hasYieldAPR"
          :yieldAPR="pool.dynamic.apr.yield"
          :poolTokens="pool.tokensList"
          :poolType="pool.poolType"
        />

        <!-- STAKING APR BREAKDOWN -->
        <StakingBreakdown :pool="pool" />
      </div>
    </div>
  </BalTooltip>
</template>
