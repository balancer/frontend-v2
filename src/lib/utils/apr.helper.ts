import { FiatCurrency } from '@/constants/currency';
import { aaveService } from '@/services/aave/aave.service';
import { FullPool, LinearPoolData, Pool } from '@/services/balancer/subgraph/types';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { LinearPoolFactory } from '@/services/linear-pool/linear-pool.factory';

type BoostedAPR = {
  total: string;
  breakdown: Record<string, string>;
};

/**
 * Assumes pool tokens are linear pools
 */
export async function calcBoostedAPR(
  linearPools: LinearPoolData[],
  totalLiquidity: string,
  prices: TokenPrices,
  currency: FiatCurrency
): Promise<void> {
  console.log('pool', linearPools);

  const calculations = Object.keys(linearPools).map(address => {
    const {
      mainToken: { address: mainToken },
      wrappedToken: { address: wrappedToken, balance: wrappedTokenBalance }
    } = linearPools[address];
    const linearPool = new LinearPoolFactory(address);
    const price = prices[mainToken][currency].toString();

    return linearPool.calcBoostedAPR(
      mainToken,
      wrappedToken,
      wrappedTokenBalance,
      totalLiquidity,
      price
    );
  });

  const results = Promise.all(calculations);
}
