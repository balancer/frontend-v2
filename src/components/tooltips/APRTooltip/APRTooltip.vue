<script setup lang="ts">
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { isVeBalPool, totalAprLabel } from '@/composables/usePoolHelpers';
import { APR_THRESHOLD } from '@/constants/pools';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';

import StakingBreakdown from './components/StakingBreakdown.vue';
import VeBalBreakdown from './components/VeBalBreakdown.vue';
import YieldBreakdown from './components/YieldBreakdown.vue';
import { AprBreakdown } from '@balancer-labs/sdk';
import { hasStakingRewards } from '@/composables/useAPR';
import useWeb3 from '@/services/web3/useWeb3';
import { usePoints } from '@/composables/usePoints';
import { useTokens } from '@/providers/tokens.provider';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  poolApr?: AprBreakdown;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();
const { isWalletReady } = useWeb3();
const { hasPoints, poolPoints, tokenPointMultiples } = usePoints(props.pool);
const { getToken } = useTokens();

/**
 * COMPUTED
 */
const apr = computed<AprBreakdown | undefined>(
  () => props.pool?.apr || props.poolApr
);
const validAPR = computed(
  () => Number(apr.value?.swapFees || 0) <= APR_THRESHOLD
);

const hasYieldAPR = computed(() => {
  return bnum(apr.value?.tokenAprs.total || '0').gt(0);
});

const hasVebalAPR = computed((): boolean => isVeBalPool(props.pool.id));

const totalLabel = computed((): string =>
  apr.value
    ? totalAprLabel(apr.value, props.pool.boost, isWalletReady.value)
    : '0'
);
</script>

<template v-slot:aprCell="pool">
  <BalTooltip v-if="validAPR" width="64" noPad>
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
        <!-- VeBal APR -->
        <VeBalBreakdown
          v-if="hasVebalAPR"
          :apr="apr?.protocolApr || 0"
          class="mb-3"
        />

        <!-- STAKING APR BREAKDOWN -->
        <StakingBreakdown :pool="pool" :poolApr="apr" class="mb-3" />

        <!-- YIELD APR BREAKDOWN -->
        <YieldBreakdown
          v-if="apr?.tokenAprs && hasYieldAPR"
          :yieldAPR="apr?.tokenAprs"
          :pool="pool"
          class="mb-3"
        />

        <!-- SWAP FEE APR -->
        <div
          class="flex justify-between items-center mb-1 text-sm font-bold whitespace-nowrap"
          data-testid="swap-fee-apr"
        >
          <span>{{ $t('swapFeeAPR') }}</span>
          {{ fNum(apr?.swapFees || '0', FNumFormats.bp) }}
        </div>

        <div
          v-if="hasPoints"
          class="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <span class="font-bold">Points</span>
          <div v-if="poolPoints" class="flex justify-between mt-2 ml-2">
            <span class="capitalize">{{ poolPoints.protocol }}</span>
            <span>{{ poolPoints.multiple }}x</span>
          </div>
          <div
            v-for="(multiple, tokenAddress) in tokenPointMultiples"
            :key="tokenAddress"
            class="flex justify-between mt-2 ml-2"
          >
            <span>{{ getToken(tokenAddress).symbol }}</span>
            <span>{{ multiple }}x</span>
          </div>
        </div>
      </div>
    </div>
  </BalTooltip>
</template>
