import { getAddress } from 'ethers/lib/utils';

import { AnyPool, Pool } from '@/services/pool/types';

import { bnum } from '..';

export function getPoolAddress(poolId: string) {
  return getAddress(poolId.slice(0, 42));
}

export function getBptPrice(pool?: Pool) {
  if (!pool) return '0';
  return bnum(pool.totalLiquidity).div(pool.totalShares);
}

export function getBptBalanceFiatValue(pool: AnyPool, balance: string) {
  return bnum(pool.totalLiquidity)
    .div(pool.totalShares)
    .times(balance)
    .toString();
}
