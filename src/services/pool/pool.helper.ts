import { fNum2 } from '@/composables/useNumbers';

import { FullPool } from '../balancer/subgraph/types';

export function getPoolWeights(pool: FullPool) {
  return Object.values(pool.onchain.tokens)
    .map(
      token =>
        `${fNum2(token.weight, {
          style: 'unit',
          unit: 'percent',
          maximumFractionDigits: 0
        })} ${token.symbol}`
    )
    .join(', ');
}
