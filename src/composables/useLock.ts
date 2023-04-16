import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';

import { useTokens } from '@/providers/tokens.provider';
import { useUserData } from '@/providers/user-data.provider';
import usePoolQuery from './queries/usePoolQuery';
import { fiatValueOf } from './usePoolHelpers';
import useVeBal, { isVeBalSupported } from './useVeBAL';

interface Options {
  enabled?: boolean;
}
export function useLock({ enabled = true }: Options = {}) {
  /**
   * COMPOSABLES
   */
  const { lockablePoolId } = useVeBal();
  const { getToken } = useTokens();

  /**
   * QUERIES
   */
  const shouldFetchLockPool = computed(
    (): boolean => isVeBalSupported.value && enabled
  );
  const lockPoolQuery = usePoolQuery(
    lockablePoolId.value as string,
    shouldFetchLockPool
  );
  const { lockQuery } = useUserData();

  /**
   * COMPUTED
   */
  const isLoadingLockPool = computed(
    (): boolean => lockPoolQuery.isLoading.value
  );

  const isLoadingLockInfo = computed((): boolean => lockQuery.isLoading.value);

  const isLoadingLock = computed(
    (): boolean => isLoadingLockPool.value || isLoadingLockInfo.value
  );

  const lockPool = computed<Pool | undefined>(() => lockPoolQuery.data.value);

  const lockPoolToken = computed((): TokenInfo | null =>
    lockPool.value != null ? getToken(lockPool.value.address) : null
  );

  const lock = computed(() => lockQuery.data.value);

  // Total fiat value of locked tokens.
  const totalLockedValue = computed((): string =>
    lockPool.value && lock.value?.hasExistingLock
      ? fiatValueOf(lockPool.value, lock.value.lockedAmount)
      : '0'
  );

  // Total locked shares (veBAL).
  const totalLockedShares = computed((): string =>
    lockPool.value && lock.value?.hasExistingLock
      ? lock.value.lockedAmount
      : '0'
  );

  return {
    isLoadingLockPool,
    isLoadingLockInfo,
    isLoadingLock,
    lockPoolToken,
    lockPool,
    lock,
    totalLockedValue,
    totalLockedShares,
  };
}
