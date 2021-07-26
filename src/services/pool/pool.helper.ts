import { fNum } from '@/composables/useNumbers';

import { FullPool } from '../balancer/subgraph/types';

export function getPoolWeights(pool: FullPool) {
  return Object.values(pool.onchain.tokens)
    .map(token => `${fNum(token.weight, 'percent_lg')} ${token.symbol}`)
    .join(', ');
}
