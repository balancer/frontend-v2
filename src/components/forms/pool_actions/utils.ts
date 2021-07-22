import { FullPool } from '@/services/balancer/subgraph/types';

export function getPoolWeights(pool: FullPool) {
  return Object.values(pool.onchain.tokens)
    .map(token => `${token.weight * 100} ${token.symbol}`)
    .join(', ');
}
