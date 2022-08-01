import { computed, Ref } from 'vue';

import { bnum } from '@/lib/utils';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

import useLockState from './useLockState';

export default function useLockAmount(
  veBalLockInfo?: Ref<VeBalLockInfo> | Ref<undefined>
) {
  /**
   * COMPOSABLES
   */
  const { lockAmount } = useLockState();

  /**
   * COMPUTED
   */
  const isValidLockAmount = computed(() => bnum(lockAmount.value || '0').gt(0));

  const isIncreasedLockAmount = computed(
    () => veBalLockInfo?.value?.hasExistingLock && isValidLockAmount.value
  );

  const totalLpTokens = computed(() => {
    return veBalLockInfo?.value?.hasExistingLock
      ? bnum(veBalLockInfo.value.lockedAmount)
          .plus(lockAmount.value || '0')
          .toString()
      : lockAmount.value || '0';
  });

  return {
    // computed
    isValidLockAmount,
    isIncreasedLockAmount,
    totalLpTokens,
  };
}
