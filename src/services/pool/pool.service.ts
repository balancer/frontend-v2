import { FiatCurrency } from '@/constants/currency';
import { AnyPool } from '../balancer/subgraph/types';
import { TokenPrices } from '../coingecko/api/price.service';
import LiquidityConcern from './concerns/liquidity.concern';

export default class PoolService {
  pool: AnyPool;
  liquidityConcern: LiquidityConcern;

  constructor(pool: AnyPool, liquidityConcernClass = LiquidityConcern) {
    this.pool = pool;
    this.liquidityConcern = new liquidityConcernClass(this);
  }

  public calcTotalLiquidity(
    prices: TokenPrices,
    currency: FiatCurrency
  ): string {
    try {
      return this.liquidityConcern.calcTotal(prices, currency);
    } catch (error) {
      console.error('Failed to calc pool liquidity:', error);
      return '0';
    }
  }
}
