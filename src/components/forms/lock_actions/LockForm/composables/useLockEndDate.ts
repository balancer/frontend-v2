import { computed } from 'vue';
import { addDays } from 'date-fns';

import useLockState from './useLockState';

import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

import {
  MAX_LOCK_PERIOD_IN_DAYS,
  MIN_LOCK_PERIOD_IN_DAYS,
  DEFAULT_LOCK_PERIOD_IN_DAYS,
  EPOCH_IN_DAYS
} from '@/components/forms/lock_actions/constants';

export default function useLockEndDate(veBalLockInfo?: VeBalLockInfo) {
  /**
   * STATE
   */
  const todaysDate = new Date();

  const minLockEndDateTimestamp = veBalLockInfo?.hasExistingLock
    ? addDays(veBalLockInfo.lockedEndDate, EPOCH_IN_DAYS).getTime()
    : addDays(todaysDate, MIN_LOCK_PERIOD_IN_DAYS).getTime();

  const maxLockEndDateTimestamp = addDays(
    todaysDate,
    MAX_LOCK_PERIOD_IN_DAYS
  ).getTime();

  const defaultLockTimestamp = addDays(
    todaysDate,
    DEFAULT_LOCK_PERIOD_IN_DAYS
  ).getTime();

  /**
   * COMPOSABLES
   */
  const { lockEndDate } = useLockState();

  /**
   * COMPUTED
   */
  const lockEndDateTimestamp = computed(() =>
    lockEndDate.value === '' ? 0 : new Date(lockEndDate.value).getTime()
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
    isExtendedLockEndDate,
    defaultLockTimestamp
  };
}
