<script setup lang="ts">
import { computed } from 'vue';
import { format } from 'date-fns';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';

import { bnum } from '@/lib/utils';

import { FullPool } from '@/services/balancer/subgraph/types';

import useVeBal from '@/composables/useVeBAL';

import { PRETTY_DATE_FORMAT } from '../../../constants';
import { LockType } from '../../../types';

type Props = {
  lockablePool: FullPool;
  totalLpTokens: string;
  lockEndDate: string;
  expectedVeBalAmount: string;
  lockType: LockType[];
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
    .times(props.totalLpTokens)
);

const isExtendLockOnly = computed(
  () =>
    props.lockType.length === 1 && props.lockType.includes(LockType.EXTEND_LOCK)
);

const isIncreaseLockOnly = computed(
  () =>
    props.lockType.length === 1 &&
    props.lockType.includes(LockType.INCREASE_LOCK)
);

// const fiatWeeklyYield = computed(() => '0');
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
        <div>{{ $t('getVeBAL.previewModal.summary.lockEndDate') }}</div>
        <div>{{ format(new Date(lockEndDate), PRETTY_DATE_FORMAT) }}</div>
      </div>
      <div class="summary-item-row">
        <div>{{ $t('getVeBAL.previewModal.summary.totalVotingEscrow') }}</div>
        <div>
          {{ fNum2(expectedVeBalAmount, FNumFormats.token) }}
          {{ veBalTokenInfo.symbol }}
        </div>
      </div>
      <!-- <div class="summary-item-row">
        <div>
          {{ $t('getVeBAL.previewModal.summary.potentialWeeklyYield') }}
        </div>
        <div>{{ fNum2(fiatWeeklyYield, FNumFormats.fiat) }}</div>
      </div> -->
    </div>
  </BalCard>
</template>

<style scoped>
.summary-item-row {
  @apply flex justify-between pb-2;
}
</style>
