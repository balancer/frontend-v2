<script setup lang="ts">
import { computed } from 'vue';
import { format } from 'date-fns';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';

import { bnum } from '@/lib/utils';

import { FullPool } from '@/services/balancer/subgraph/types';

import useVeBal from '@/composables/useVeBAL';

type Props = {
  lockablePool: FullPool;
  lockAmount: string;
  lockedUntil: string;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { veBalTokenInfo } = useVeBal();

/**
 * COMPUTED
 */
const fiatTotal = computed(() =>
  bnum(props.lockablePool.totalLiquidity)
    .div(props.lockablePool.totalShares)
    .times(props.lockAmount)
);

const veBalAmount = computed(() => props.lockAmount);

const fiatWeeklyYield = computed(() => '0');
</script>

<template>
  <BalCard noPad shadow="none" class="mt-4">
    <div class="p-4 w-full border-b dark:border-gray-900">
      <h6>
        {{ $t('getVeBAL.previewModal.summary.title') }}
      </h6>
    </div>
    <div class="-mt-2 p-4">
      <div class="summary-item-row">
        <div>{{ $t('getVeBAL.previewModal.summary.totalToLock') }}</div>
        <div>{{ fNum2(fiatTotal, FNumFormats.fiat) }}</div>
      </div>
      <div class="summary-item-row">
        <div>{{ $t('getVeBAL.previewModal.summary.lockedUntil') }}</div>
        <div>{{ format(new Date(lockedUntil), 'd MMM yyyy') }}</div>
      </div>
      <div class="summary-item-row">
        <div>{{ $t('getVeBAL.previewModal.summary.veBalYouGet') }}</div>
        <div>
          {{ fNum2(veBalAmount, FNumFormats.token) }}
          {{ veBalTokenInfo.symbol }}
        </div>
      </div>
      <div class="summary-item-row">
        <div>
          {{ $t('getVeBAL.previewModal.summary.potentialWeeklyYield') }}
        </div>
        <div>{{ fNum2(fiatWeeklyYield, FNumFormats.fiat) }}</div>
      </div>
    </div>
  </BalCard>
</template>

<style scoped>
.summary-item-row {
  @apply flex justify-between pb-2;
}
</style>
