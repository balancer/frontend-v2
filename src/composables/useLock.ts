import { Pool, PoolType } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';

import { useTokens } from '@/providers/tokens.provider';
import { useUserData } from '@/providers/user-data.provider';
import { fiatValueOf } from './usePoolHelpers';
import { bnum } from '@/lib/utils';

export const staticLockPool: Pool = {
  id: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
  name: 'Balancer 80 BAL 20 WETH',
  address: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
  chainId: 1,
  poolType: PoolType.Weighted,
  poolTypeVersion: 1,
  swapFee: '0.005',
  swapEnabled: true,
  protocolYieldFeeCache: '0.5',
  protocolSwapFeeCache: '0.5',
  owner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  factory: '0xa5bf2ddf098bb0ef6d120c98217dd6b141c74ee0',
  symbol: 'B-80BAL-20WETH',
  tokens: [
    {
      address: '0xba100000625a3754423978a60c9317c58a424e3d',
      balance: '19385573.977733216984154245',
      decimals: 18,
      isExemptFromYieldProtocolFee: false,
      priceRate: '1',
      symbol: 'BAL',
      token: {
        pool: null,
        latestUSDPrice: '3.020051763151765590907891699486145',
      },
      weight: '0.8',
    },
    {
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      balance: '3708.004332746461130832',
      decimals: 18,
      isExemptFromYieldProtocolFee: false,
      priceRate: '1',
      symbol: 'WETH',
      token: {
        pool: null,
        latestUSDPrice: '2544.423752510128812336112279381925',
      },
      weight: '0.2',
    },
  ],
  tokensList: [
    '0xba100000625a3754423978a60c9317c58a424e3d',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  ],
  tokenAddresses: [
    '0xba100000625a3754423978a60c9317c58a424e3d',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  ],
  totalLiquidity: '67980171.169812751723110183',
  totalShares: '6792743.266911456277523322',
  totalSwapFee: '6173259.879907230383616330051651873',
  totalSwapVolume: '1398500114.898508628102297818442082',
  priceRateProviders: [],
  createTime: 1620153071,
  totalWeight: '1',
  lowerTarget: '0',
  upperTarget: '0',
  isInRecoveryMode: false,
  isPaused: false,
  isNew: false,
  onchain: {
    tokens: {
      '0xba100000625a3754423978a60c9317c58a424e3d': {
        decimals: 18,
        balance: '19385573.977733216984154245',
        weight: 0.8,
        symbol: 'BAL',
        name: 'Balancer',
        logoURI:
          'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xba100000625a3754423978a60c9317c58a424e3d.png',
      },
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
        decimals: 18,
        balance: '3708.004332746461130832',
        weight: 0.2,
        symbol: 'WETH',
        name: 'Wrapped Ether',
        logoURI:
          'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
      },
    },
    amp: '0',
    swapEnabled: true,
    totalSupply: '6792743.266911456277523322',
    decimals: 18,
    swapFee: '0.005',
  },
  feesSnapshot: '866.901337693887527854586071982',
  volumeSnapshot: '333819.702829775009564326720188',
};

interface Options {
  enabled?: boolean;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useLock({ enabled = true }: Options = {}) {
  /**
   * COMPOSABLES
   */
  // const { lockablePoolId } = useVeBal();
  const { getToken, balanceFor } = useTokens();

  /**
   * QUERIES
   */
  // const shouldFetchLockPool = computed(
  //   (): boolean => isVeBalSupported.value && enabled
  // );
  // const lockPoolQuery = usePoolQuery(
  //   lockablePoolId.value as string,
  //   shouldFetchLockPool
  // );
  const { lockQuery } = useUserData();

  /**
   * COMPUTED
   */
  const isLoadingLockPool = false;

  const isLoadingLockInfo = computed((): boolean => lockQuery.isLoading.value);

  const isLoadingLock = computed((): boolean => isLoadingLockInfo.value);

  const lockPool = computed<Pool | undefined>(() => staticLockPool);
  console.log('lockPool', lockPool.value);

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

  const bptPrice = computed(() => {
    if (!lockPool.value) return bnum(0);
    return bnum(lockPool.value.totalLiquidity).div(lockPool.value.totalShares);
  });

  const bptBalance = computed(() => {
    if (!lockPool.value) return bnum(0);
    return balanceFor(lockPool.value.address);
  });

  const fiatTotal = computed(() =>
    bptPrice.value.times(bptBalance.value).toString()
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
    bptBalance,
    fiatTotal,
  };
}
