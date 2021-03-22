import { Pool } from '@/api/subgraph';

export function getPoolLiquidity(pool: Pool, prices) {
  if (pool.strategyType == 2) {
    const totalWeight = pool.weights.reduce(
      (total, value) => total + parseFloat(value),
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
      const weight = pool.weights ? parseFloat(pool.weights[i]) : 0;
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
