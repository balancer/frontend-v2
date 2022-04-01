<script setup lang="ts">
import { format } from 'date-fns';

import { PRETTY_DATE_FORMAT } from '@/components/forms/lock_actions/constants';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useVeBal from '@/composables/useVeBAL';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

/**
 * TYPES
 */
type Props = {
  fiatTotalLpTokens: string;
  veBalLockInfo: VeBalLockInfo;
};

/**
 * PROPS
 */
defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { veBalTokenInfo } = useVeBal();

/**
 * COMPUTED
 */
</script>

<template>
  <div class="summary-table">
    <h6 class="p-2">
      {{ $t('unlockVeBAL.previewModal.summary.title') }}
    </h6>
    <div class="p-2">
      <div class="summary-item-row">
        <div>
          {{ $t('unlockVeBAL.previewModal.summary.totalToUnlock') }}
        </div>
        <div>
          {{ fNum2(fiatTotalLpTokens, FNumFormats.fiat) }}
        </div>
      </div>
      <div class="summary-item-row">
        <div>
          {{ $t('unlockVeBAL.previewModal.summary.totalVotingEscrow') }}
        </div>
        <div>
          {{ fNum2(0, FNumFormats.token) }}
          {{ veBalTokenInfo.symbol }}
        </div>
      </div>
      <div class="summary-item-row">
        <div>
          {{ $t('unlockVeBAL.previewModal.summary.expiredOn') }}
        </div>
        <div>
          {{ format(veBalLockInfo.lockedEndDate, PRETTY_DATE_FORMAT) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-table {
  @apply border dark:border-gray-700 divide-y dark:divide-gray-700 rounded-lg mt-4;
}

.summary-item-row {
  @apply flex justify-between pb-2;
}
</style>
