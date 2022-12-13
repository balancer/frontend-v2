import { getAddress } from '@ethersproject/address';

import { AnyPool } from '@/services/pool/types';

import { bnum } from '..';

export function getPoolAddress(poolId: string) {
  return getAddress(poolId.slice(0, 42));
}

export function getBptBalanceFiatValue(pool: AnyPool, balance: string): string {
  return bnum(pool.totalLiquidity)
    .div(pool.totalShares)
    .times(balance)
    .toString();
}
