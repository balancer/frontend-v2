import { computed } from 'vue';
import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';

import usePoolQuery from './queries/usePoolQuery';
import { isL2 } from './useNetwork';
import { useTokens } from '@/providers/tokens.provider';
import useVeBal from './useVeBAL';
import { useUserData } from '@/providers/user-data.provider';
import { fiatValueOf } from './usePool';

export function useLock() {
  /**
   * COMPOSABLES
   */
  const { lockablePoolId } = useVeBal();
  const { getToken } = useTokens();

  /**
   * QUERIES
   */
  const shouldFetchLockPool = computed((): boolean => !isL2.value);
  const lockPoolQuery = usePoolQuery(
    lockablePoolId.value as string,
    shouldFetchLockPool
  );
  const { lockQuery } = useUserData();

  /**
   * COMPUTED
   */
  const isLoadingLockPool = computed(
    (): boolean => lockPoolQuery.isLoading.value || lockPoolQuery.isIdle.value
  );

  const isLoadingLockInfo = computed(
    (): boolean => lockQuery.isLoading.value || lockQuery.isIdle.value
  );

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

  return {
    isLoadingLockPool,
    isLoadingLockInfo,
    isLoadingLock,
    lockPoolToken,
    lockPool,
    lock,
    totalLockedValue,
  };
}
