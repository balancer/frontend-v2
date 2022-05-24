<script setup lang="ts">
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { totalAprLabel } from '@/composables/usePool';
import { APR_THRESHOLD } from '@/constants/pools';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/balancer/subgraph/types';
import { hasStakingRewards } from '@/services/staking/utils';

import StakingBreakdown from './components/StakingBreakdown.vue';
import YieldBreakdown from './components/YieldBreakdown.vue';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
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
  () => Number(props?.pool?.apr?.total.unstaked || '0') * 100 <= APR_THRESHOLD
);

const hasYieldAPR = computed(() =>
  bnum(props?.pool?.apr?.yield.total || '0').gt(0)
);

const totalLabel = computed((): string => {
  const poolAPRs = props.pool?.apr;
  if (!poolAPRs) return '0';

  return totalAprLabel(poolAPRs, props.pool.boost);
});
</script>

<template v-slot:aprCell="pool">
  <BalTooltip width="auto" noPad v-if="validAPR">
    <template v-slot:activator>
      <div class="ml-1">
        <StarsIcon
          v-if="hasYieldAPR || hasStakingRewards(pool.apr)"
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
        <div>{{ totalLabel }}</div>
      </div>
      <div class="p-3">
        <!-- SWAP FEE APR -->
        <div class="whitespace-nowrap flex items-center mb-1">
          {{ fNum2(pool?.apr?.swap || '0', FNumFormats.percent) }}
          <span class="ml-1 text-gray-500 text-xs">{{ $t('swapFeeAPR') }}</span>
        </div>

        <!-- YIELD APR BREAKDOWN -->
        <YieldBreakdown
          v-if="hasYieldAPR"
          :yieldAPR="pool?.apr?.yield"
          :poolTokens="pool.tokensList"
          :poolType="pool.poolType"
        />

        <!-- STAKING APR BREAKDOWN -->
        <StakingBreakdown :pool="pool" />
      </div>
    </div>
  </BalTooltip>
</template>
