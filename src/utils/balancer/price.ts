import { BigNumber } from '@ethersproject/bignumber';
import { Pool } from './types';

export function getPoolLiquidity(pool: Pool, prices) {
  if (pool.strategy.type == 2) {
    const sumWeight =
      pool.strategy.weights?.reduce(
        (sum, weight) => sum.add(weight),
        BigNumber.from(0)
      ) || BigNumber.from(0);
    const sumValue = pool.tokenBalances.reduce((sum, balance, i) => {
      const token = pool.tokens[i];
      const price = prices[token] ? prices[token].price : 0;
      const value = balance.mul(price);
      return sum.add(value);
    }, BigNumber.from(0));
    if (sumWeight.gt(0)) {
      return sumValue.div(sumWeight).toString();
    } else {
      return '0';
    }
  }
  return '0';
}
