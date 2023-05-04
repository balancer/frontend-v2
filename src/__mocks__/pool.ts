import { PoolMock } from './weighted-pool';
import { BoostedPoolMock } from './boosted-pool';
import { Pool, PoolToken, PoolType } from '@/services/pool/types';

export const EmptyPoolMock: Pool = {
  protocolSwapFeeCache: '',
  id: '',
  address: '',
  name: '',
  owner: '',
  chainId: 1,
  poolType: PoolType.Weighted,
  factory: '',
  tokens: [],
  tokensList: [],
  swapFee: '0',
  totalSwapFee: '0',
  totalSwapVolume: '0',
  totalLiquidity: '0',
  totalShares: '0',
  swapEnabled: true,
  totalWeight: '0',
  createTime: Date.now(),
  symbol: '',
  poolTypeVersion: 0,
  protocolYieldFeeCache: '',
  lowerTarget: '',
  upperTarget: '',
  isPaused: false,
};

export { PoolMock, BoostedPoolMock };

export function anEmptyPool(tokens: PoolToken[]) {
  const pool = EmptyPoolMock;
  pool.tokens = tokens;
  return EmptyPoolMock;
}
