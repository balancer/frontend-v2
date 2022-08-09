import { getAddress } from 'ethers/lib/utils';

import { AnyPool, Pool } from '@/services/pool/types';

import { bnum } from '..';
import BigNumber from 'bignumber.js';

export function getPoolAddress(poolId: string) {
  return getAddress(poolId.slice(0, 42));
}

export function getBptPrice(pool?: Pool): BigNumber {
  if (!pool || !pool.totalLiquidity) return bnum('0');
  return bnum(pool.totalLiquidity).div(pool.totalShares);
}

export function getBptBalanceFiatValue(pool: AnyPool, balance: string): string {
  if (!pool.totalLiquidity) return '0';
  return bnum(pool.totalLiquidity)
    .div(pool.totalShares)
    .times(balance)
    .toString();
}
