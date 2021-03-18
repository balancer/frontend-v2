import { formatUnits } from '@ethersproject/units';

import { Pool } from './types';

export function getPoolLiquidity(pool: Pool, tokens, prices) {
  if (pool.strategy.type == 2) {
    let sumWeight = 0;
    let sumValue = 0;

    for (let i = 0; i < pool.tokens.length; i++) {
      const token = pool.tokens[i];
      if (!prices[token]) {
        continue;
      }
      const price = prices[token].price;

      const balance = pool.tokenBalances[i];
      const decimals = tokens[token].decimals;
      const amount = parseFloat(formatUnits(balance, decimals));

      const value = amount * price;
      const weight = pool.weightsPercent ? pool.weightsPercent[i] : 0;
      sumValue = sumValue + value;
      sumWeight = sumWeight + weight;
    }
    if (sumWeight > 0) {
      const liquidity = (sumValue / sumWeight) * 100;
      return liquidity.toString();
    } else {
      return '0';
    }
  }
  return '0';
}
