import {  DecoratedPool } from '@/services/balancer/subgraph/types';
import { getAddress } from 'ethers/lib/utils';
import { bnum } from '..';

export function getPoolAddress(poolId: string) {
  return getAddress(poolId.slice(0, 42));
}

export function getBptPrice(pool?: DecoratedPool) {
  if (!pool) return '0';
  return bnum(pool.totalLiquidity)
    .div(pool.totalShares)
    .toString();
}
