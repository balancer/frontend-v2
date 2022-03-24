import { AnyPool } from '@/services/balancer/subgraph/types';
import { getAddress } from 'ethers/lib/utils';
import { bnum } from '..';

export function getPoolAddress(poolId: string) {
  return getAddress(poolId.slice(0, 42));
}

export function getBptBalanceFiatValue(pool: AnyPool, balance: string) {
  return bnum(pool.totalLiquidity)
    .div(pool.totalShares)
    .times(balance)
    .toString();
}
