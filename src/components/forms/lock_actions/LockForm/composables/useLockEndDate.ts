import { addDays, nextThursday, previousThursday, startOfDay } from 'date-fns';
import { computed } from 'vue';

import {
  MAX_LOCK_PERIOD_IN_DAYS,
  MIN_LOCK_PERIOD_IN_DAYS
} from '@/components/forms/lock_actions/constants';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

import useLockState from './useLockState';

export default function useLockEndDate(veBalLockInfo?: VeBalLockInfo) {
  /**
   * STATE
   */
  const todaysDate = new Date();

  const minLockEndDateTimestamp = startOfDay(
    nextThursday(
      addDays(
        veBalLockInfo?.hasExistingLock
          ? veBalLockInfo.lockedEndDate
          : todaysDate,
        MIN_LOCK_PERIOD_IN_DAYS
      )
    )
  ).getTime();

  const maxLockEndDateTimestamp = startOfDay(
    previousThursday(addDays(todaysDate, MAX_LOCK_PERIOD_IN_DAYS))
  ).getTime();

  /**
   * COMPOSABLES
   */
  const { lockEndDate } = useLockState();

  /**
   * COMPUTED
   */
  const lockEndDateTimestamp = computed(() =>
    lockEndDate.value === ''
      ? 0
      : startOfDay(new Date(lockEndDate.value)).getTime()
  );

  const isValidLockEndDate = computed(
    () =>
      lockEndDateTimestamp.value >= minLockEndDateTimestamp &&
      lockEndDateTimestamp.value <= maxLockEndDateTimestamp
  );

  const isExtendedLockEndDate = computed(
    () => veBalLockInfo?.hasExistingLock && isValidLockEndDate.value
  );

  return {
    // state
    todaysDate,

    // computed
    minLockEndDateTimestamp,
    maxLockEndDateTimestamp,
    isValidLockEndDate,
    isExtendedLockEndDate
  };
}
