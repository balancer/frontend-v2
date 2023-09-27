<script setup lang="ts">
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { isVeBalPool, totalAprLabel } from '@/composables/usePoolHelpers';
import { APR_THRESHOLD } from '@/constants/pools';
import { Pool } from '@/services/pool/types';

import StakingBreakdown from './components/StakingBreakdown.vue';
// import VeBalBreakdown from './components/VeBalBreakdown.vue';
import YieldBreakdown from './components/YieldBreakdown.vue';
import { hasStakingRewards } from '@/composables/useAPR';
import {
  GqlBalancePoolAprItem,
  GqlPoolApr,
} from '@/services/api/graphql/generated/api-types';

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
const { fNum } = useNumbers();

/**
 * COMPUTED
 */
const apr = computed<GqlPoolApr | undefined>(
  () => props.pool?.apr || props.pool.apr
);
const validAPR = computed(
  () => Number(apr.value?.swapApr || 0) <= APR_THRESHOLD
);

const yieldAprItems = computed<GqlBalancePoolAprItem[]>(() => {
  if (!apr.value) return [];
  return apr.value?.items.filter(item => {
    if (item.title.match(/reward/)) return false;
    if (item.title.match(/Swap fees/)) return false;
    return true;
  });
});

const rewardAprItems = computed<GqlBalancePoolAprItem[]>(() => {
  if (!apr.value) return [];
  return apr.value?.items.filter(item => {
    if (item.title.match(/reward/)) return true;
  });
});

const hasYieldAPR = computed(() => {
  return yieldAprItems.value.length > 0;
});

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
          v-if="hasStakingRewards(apr) || hasVebalAPR"
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
      <div
        class="px-3 pt-3 pb-1 bg-gray-50 dark:bg-gray-800 rounded-t"
        data-testid="total-apr"
      >
        <div class="text-secondary">
          {{ $t('totalAPR') }}
        </div>
        <div class="text-lg font-bold normal-nums tracking-tighter">
          {{ totalLabel }}
        </div>
      </div>
      <div class="p-3 text-left">
        <!-- SWAP FEE APR -->
        <div
          class="flex items-center mb-1 whitespace-nowrap"
          data-testid="swap-fee-apr"
        >
          {{ fNum(apr?.swapApr || '0', FNumFormats.percent) }}
          <span class="ml-1 text-xs text-secondary">
            {{ $t('swapFeeAPR') }}
          </span>
        </div>

        <!-- VeBal APR -->
        <!-- Not implemented yet from API -->
        <!-- <VeBalBreakdown v-if="hasVebalAPR" :apr="apr?.nativeRewardApr || 0" /> -->

        <!-- YIELD APR BREAKDOWN -->
        <YieldBreakdown
          v-if="apr?.items && hasYieldAPR"
          :items="yieldAprItems"
          :pool="pool"
        />

        <!-- STAKING APR BREAKDOWN -->
        <StakingBreakdown :pool="pool" :items="rewardAprItems" />
      </div>
    </div>
  </BalTooltip>
</template>
