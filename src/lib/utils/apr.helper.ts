import { FiatCurrency } from '@/constants/currency';
import { aaveService } from '@/services/aave/aave.service';
import { Pool } from '@/services/balancer/subgraph/types';
import { TokenPrices } from '@/services/coingecko/api/price.service';

type BoostedAPR = {
  total: string;
  breakdown: Record<string, string>;
};

export async function calcBoostedAPR(
  mainTokens: string[],
  wrappedTokens: string[],
  wrappedTokenBalances: string[],
  totalLiquidity: string,
  prices: TokenPrices,
  currency: FiatCurrency
): Promise<void> {
  console.log('wrappedTokens', wrappedTokens);
  // const await aaveService.calcWeightedSupplyAPRFor(pool, prices, currency);
}
