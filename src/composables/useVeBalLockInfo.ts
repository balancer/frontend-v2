import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';

const MINIMUM_LOCK_TIME = 86_400_000 * 7;

export function useVeBalLockInfo() {
  const veBalLockInfoQuery = useVeBalLockInfoQuery();

  const isLoading = computed(() => veBalLockInfoQuery.isLoading);

  const veBalLockInfo = computed(() => veBalLockInfoQuery.data.value);

  const veBalExpired = computed(() => veBalLockInfo.value?.isExpired);

  const hasLock = computed(
    (): boolean =>
      !!veBalLockInfo.value?.hasExistingLock && !veBalLockInfo.value?.isExpired
  );

  const hasExpiredLock = computed(
    (): boolean =>
      !!veBalLockInfo.value?.hasExistingLock && veBalLockInfo.value?.isExpired
  );

  const veBalLockTooShort = computed((): boolean => {
    if (
      veBalLockInfo.value?.hasExistingLock &&
      !veBalLockInfo.value?.isExpired
    ) {
      const lockEndDate = veBalLockInfo.value?.lockedEndDate;
      return lockEndDate < Date.now() + MINIMUM_LOCK_TIME;
    }

    return false;
  });

  return {
    isLoading,
    hasLock,
    hasExpiredLock,
    veBalLockTooShort,
    veBalExpired,
  };
}
