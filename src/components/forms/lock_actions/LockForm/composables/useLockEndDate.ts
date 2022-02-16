import { computed } from 'vue';
import { addDays, format } from 'date-fns';

import useLockState from './useLockState';

import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

import {
  MAX_LOCK_IN_DAYS,
  MIN_LOCK_IN_DAYS,
  DEFAULT_LOCK_IN_DAYS,
  INPUT_DATE_FORMAT
} from '../constants';

export default function useLockEndDate(veBalLockInfo: VeBalLockInfo) {
  /**
   * COMPOSABLES
   */
  const { lockEndDate } = useLockState();

  /**
   * COMPUTED
   */
  const todaysDate = new Date();

  const minLockEndDateTimestamp = veBalLockInfo.hasExistingLock
    ? veBalLockInfo.lockedEndDate
    : addDays(todaysDate, MIN_LOCK_IN_DAYS).getTime();

  const maxLockEndDateTimestamp = addDays(
    todaysDate,
    MAX_LOCK_IN_DAYS
  ).getTime();

  const defaultLockTimestamp = addDays(
    todaysDate,
    DEFAULT_LOCK_IN_DAYS
  ).getTime();

  lockEndDate.value = veBalLockInfo.hasExistingLock
    ? format(veBalLockInfo.lockedEndDate, INPUT_DATE_FORMAT)
    : format(defaultLockTimestamp, INPUT_DATE_FORMAT);

  /**
   * COMPUTED
   */
  const lockEndDateTimestamp = computed(() =>
    new Date(lockEndDate.value).getTime()
  );

  const isValidLockEndDate = computed(
    () =>
      lockEndDateTimestamp.value >= minLockEndDateTimestamp &&
      lockEndDateTimestamp.value <= maxLockEndDateTimestamp
  );

  const isExtendedLockEndDate = computed(
    () =>
      veBalLockInfo.hasExistingLock &&
      lockEndDateTimestamp.value > veBalLockInfo.lockedEndDate
  );

  return {
    // computed
    todaysDate,
    minLockEndDateTimestamp,
    maxLockEndDateTimestamp,
    isValidLockEndDate,
    isExtendedLockEndDate
  };
}
