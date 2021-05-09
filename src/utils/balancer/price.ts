import { Pool } from '@/services/balancer/subgraph/types';
import { Prices } from '@/api/coingecko';

export function getPoolLiquidity(pool: Pool, prices: Prices) {
  if (pool.poolType == 'Weighted') {
    const totalWeight = pool.tokens.reduce(
      (total, token) => total + parseFloat(token.weight),
      0
    );
    let sumWeight = 0;
    let sumValue = 0;

    for (let i = 0; i < pool.tokens.length; i++) {
      const token = pool.tokens[i];
      if (!prices[token.address]) {
        continue;
      }
      const price = prices[token.address].price;
      const balance = parseFloat(pool.tokens[i].balance);

      const value = balance * price;
      const weight = token.weight ? parseFloat(token.weight) : 0;
      sumValue = sumValue + value;
      sumWeight = sumWeight + weight;
    }
    if (sumWeight > 0) {
      const liquidity = (sumValue / sumWeight) * totalWeight;
      return liquidity.toString();
    } else {
      return '0';
    }
  }
  return '0';
}
