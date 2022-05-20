import { numF } from '@/composables/useNumbers';

import { FullPool } from '../balancer/subgraph/types';

export function getPoolWeights(pool: FullPool) {
  return Object.values(pool.onchain.tokens)
    .map(
      token =>
        `${numF(token.weight, {
          style: 'percent',
          maximumFractionDigits: 0
        })} ${token.symbol}`
    )
    .join(', ');
}
