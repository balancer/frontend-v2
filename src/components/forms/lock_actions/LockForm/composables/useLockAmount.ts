import { computed } from 'vue';

import { bnum } from '@/lib/utils';

import useLockState from './useLockState';

import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

export default function useLockAmount(veBalLockInfo?: VeBalLockInfo) {
  /**
   * COMPOSABLES
   */
  const { lockAmount } = useLockState();

  /**
   * COMPUTED
   */
  const isValidLockAmount = computed(() => bnum(lockAmount.value || '0').gt(0));

  const isIncreasedLockAmount = computed(
    () => veBalLockInfo?.hasExistingLock && isValidLockAmount.value
  );

  const totalLpTokens = computed(() => {
    return veBalLockInfo?.hasExistingLock
      ? bnum(veBalLockInfo.lockedAmount)
          .plus(lockAmount.value || '0')
          .toString()
      : lockAmount.value || '0';
  });

  return {
    // computed
    isValidLockAmount,
    isIncreasedLockAmount,
    totalLpTokens
  };
}
