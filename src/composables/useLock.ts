import { bnum } from '@/lib/utils';
import { FullPool } from '@/services/balancer/subgraph/types';
import { TokenInfo } from '@/types/TokenList';
import BigNumber from 'bignumber.js';
import { computed } from 'vue';
import usePoolQuery from './queries/usePoolQuery';
import useVeBalLockInfoQuery from './queries/useVeBalLockInfoQuery';
import { isL2 } from './useNetwork';
import useTokens from './useTokens';
import useVeBal from './useVeBAL';

export function useLock() {
  /**
   * COMPOSABLES
   */
  const { lockablePoolId } = useVeBal();
  const { tokens } = useTokens();

  /**
   * QUERIES
   */
  const shouldFetchLockPool = computed((): boolean => !isL2.value);
  const lockPoolQuery = usePoolQuery(
    lockablePoolId.value as string,
    shouldFetchLockPool
  );
  const lockQuery = useVeBalLockInfoQuery();

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

  const lockPool = computed<FullPool | undefined>(
    () => lockPoolQuery.data.value
  );

  const lockPoolToken = computed((): TokenInfo | null =>
    lockPool.value != null ? tokens.value[lockPool.value.address] : null
  );

  const lock = computed(() => lockQuery.data.value);

  const poolShares = computed(
    (): BigNumber =>
      lockPool.value
        ? bnum(lockPool.value.totalLiquidity).div(lockPool.value.totalShares)
        : bnum(0)
  );

  const lockFiatValue = computed((): string =>
    lock.value && lock.value.hasExistingLock
      ? poolShares.value.times(lock.value.lockedAmount).toString()
      : '0'
  );

  return {
    isLoadingLockPool,
    isLoadingLockInfo,
    isLoadingLock,
    lockPoolToken,
    lockPool,
    lock,
    lockFiatValue
  };
}
