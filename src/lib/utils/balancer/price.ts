import { isStable, isWeighted } from '@/composables/usePool';
import { FiatCurrency } from '@/constants/currency';
import { Pool } from '@/services/balancer/subgraph/types';
import { TokenPrices } from '@/services/coingecko/api/price.service';

export function getPoolLiquidity(
  pool: Pool,
  prices: TokenPrices,
  currency: FiatCurrency
) {
  if (isWeighted(pool)) {
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
      const price = prices[token.address][currency];
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
  // TODO [improvement]: if price is missing, compute spot price based on balances and amp factor
  if (isStable(pool)) {
    let sumBalance = 0;
    let sumValue = 0;

    for (let i = 0; i < pool.tokens.length; i++) {
      const token = pool.tokens[i];
      // if a token's price is unkown, ignore it
      // it will be computed at the next step
      if (!prices[token.address]) {
        continue;
      }
      const price = prices[token.address][currency];
      const balance = parseFloat(pool.tokens[i].balance);

      const value = balance * price;
      sumValue = sumValue + value;
      sumBalance = sumBalance + balance;
    }
    // if at least the partial value of the pool is known
    // then compute the rest of the value
    if (sumBalance > 0) {
      // assume relative spot price = 1
      const avgPrice = sumValue / sumBalance;
      for (let i = 0; i < pool.tokens.length; i++) {
        const token = pool.tokens[i];
        // if a token's price is known, skip it
        // it has been taken into account in the prev step
        if (prices[token.address]) {
          continue;
        }
        const balance = parseFloat(pool.tokens[i].balance);

        const value = balance * avgPrice;
        sumValue = sumValue + value;
        sumBalance = sumBalance + balance;
      }
      return sumValue.toString();
    } else {
      return '0';
    }
  }
  return '0';
}
