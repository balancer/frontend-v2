import { AnyPool, Pool } from '@/services/balancer/subgraph/types';

import { bnum } from '..';

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
