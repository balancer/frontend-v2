<script setup lang="ts">
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { isVeBalPool, totalAprLabel } from '@/composables/usePool';
import { APR_THRESHOLD } from '@/constants/pools';
import { bnum } from '@/lib/utils';
import { Pool, PoolAPRs } from '@/services/pool/types';
import { hasStakingRewards } from '@/services/staking/utils';

import StakingBreakdown from './components/StakingBreakdown.vue';
import VeBalBreakdown from './components/VeBalBreakdown.vue';
import YieldBreakdown from './components/YieldBreakdown.vue';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  poolApr?: PoolAPRs;
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
const apr = computed(() => props.pool?.apr || props.poolApr);
const validAPR = computed(
  () => Number(apr.value?.total?.unstaked || '0') * 100 <= APR_THRESHOLD
);

const hasYieldAPR = computed(() => bnum(apr.value?.yield.total || '0').gt(0));

const hasVebalAPR = computed((): boolean => isVeBalPool(props.pool.id));

const totalLabel = computed((): string =>
  apr.value ? totalAprLabel(apr.value, props.pool.boost) : '0'
);
</script>

<template v-slot:aprCell="pool">
  <BalTooltip v-if="validAPR" width="auto" noPad>
    <template #activator>
      <div class="ml-1">
        <StarsIcon
          v-if="hasYieldAPR || hasStakingRewards(apr) || hasVebalAPR"
          :gradFrom="hasVebalAPR ? 'purple' : 'yellow'"
          class="-mr-1 h-4"
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
        <div class="text-secondary">
          {{ $t('totalAPR') }}
        </div>
        <div>{{ totalLabel }}</div>
      </div>
      <div class="p-3 text-left">
        <!-- SWAP FEE APR -->
        <div class="flex items-center mb-1 whitespace-nowrap">
          {{ fNum2(apr?.swap || '0', FNumFormats.percent) }}
          <span class="ml-1 text-xs text-secondary">
            {{ $t('swapFeeAPR') }}
          </span>
        </div>

        <!-- VeBal APR -->
        <VeBalBreakdown v-if="hasVebalAPR" :apr="apr?.veBal || '0'" />

        <!-- YIELD APR BREAKDOWN -->
        <YieldBreakdown
          v-if="hasYieldAPR && apr"
          :yieldAPR="apr.yield"
          :pool="pool"
        />

        <!-- STAKING APR BREAKDOWN -->
        <StakingBreakdown :pool="pool" :poolApr="apr" />
      </div>
    </div>
  </BalTooltip>
</template>
