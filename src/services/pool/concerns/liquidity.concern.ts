import {
  isStableLike,
  isStablePhantom,
  isWeightedLike
} from '@/composables/usePool';
import { FiatCurrency } from '@/constants/currency';
import { bnum } from '@/lib/utils';
import {
  OnchainTokenData,
  PoolToken,
  PoolType
} from '@/services/balancer/subgraph/types';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { getAddress } from '@ethersproject/address';
import PoolService from '../pool.service';

interface OnchainTokenInfo extends OnchainTokenData {
  address: string;
}

export default class LiquidityConcern {
  poolService: PoolService;
  poolType: PoolType;
  poolTokens: OnchainTokenInfo[] | PoolToken[];

  constructor(poolService: PoolService) {
    this.poolService = poolService;
    this.poolType = this.poolService.pool.poolType;
    this.poolTokens = this.onchainPoolTokens || this.poolService.pool.tokens;
  }

  public get onchainPoolTokens(): OnchainTokenInfo[] | null {
    if (this.poolService.pool.onchain) {
      const tokenMap = this.poolService.pool.onchain.tokens;
      const addresses = Object.keys(tokenMap);
      const tokens = Object.values(tokenMap);
      return tokens.map<OnchainTokenInfo>(
        (token: OnchainTokenData, i: number) => ({
          ...token,
          address: addresses[i]
        })
      );
    }
    return null;
  }

  public calcTotal(prices: TokenPrices, currency: FiatCurrency): string {
    if (!this.hasPoolTokens) throw new Error('Missing onchain pool token data');

    if (isWeightedLike(this.poolType)) {
      return this.calcWeightedTotal(prices, currency);
    } else if (isStableLike(this.poolType)) {
      return this.calcStableTotal(prices, currency);
    }

    return '0';
  }

  public calcWeightedTotal(
    prices: TokenPrices,
    currency: FiatCurrency
  ): string {
    const weights = this.poolTokens.map<number>(token => token.weight);
    const totalWeight = weights.reduce(
      (total, weight) => total + Number(weight),
      0
    );
    let sumWeight = bnum(0);
    let sumValue = bnum(0);

    for (let i = 0; i < this.poolTokens.length; i++) {
      const token = this.poolTokens[i];
      const address = getAddress(token.address);

      if (!prices[address]) {
        continue;
      }
      const price = prices[address][currency];
      const balance = token.balance;

      const value = bnum(balance).times(price);
      const weight = token.weight ? token.weight : 0;
      sumValue = sumValue.plus(value);
      sumWeight = sumWeight.plus(weight);
    }

    if (sumWeight.gt(0)) {
      const liquidity = sumValue.dividedBy(sumWeight).times(totalWeight);
      return liquidity.toString();
    }

    return '0';
  }

  public calcStableTotal(prices: TokenPrices, currency: FiatCurrency): string {
    let tokens = this.poolTokens;

    if (
      isStablePhantom(this.poolType) &&
      this.poolService.pool.linearPoolTokensMap != null
    ) {
      tokens = Object.values(this.poolService.pool.linearPoolTokensMap);
    }

    let sumBalance = bnum(0);
    let sumValue = bnum(0);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const address = getAddress(token.address);

      // if a token's price is unknown, ignore it
      // it will be computed at the next step
      if (!prices[address]) {
        continue;
      }
      const price = prices[address][currency];
      const balance = token.balance;

      const value = bnum(balance).times(price);
      sumValue = sumValue.plus(value);
      sumBalance = sumBalance.plus(balance);
    }
    // if at least the partial value of the pool is known
    // then compute the rest of the value
    if (sumBalance.gt(0)) {
      // assume relative spot price = 1
      const avgPrice = sumValue.dividedBy(sumBalance);

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const address = getAddress(token.address);
        // if a token's price is known, skip it
        // it has been taken into account in the prev step
        if (prices[address]) {
          continue;
        }
        const balance = token.balance;

        const value = bnum(balance).times(avgPrice);
        sumValue = sumValue.plus(value);
        sumBalance = sumBalance.plus(balance);
      }

      return sumValue.toString();
    }

    return '0';
  }

  private get hasPoolTokens(): boolean {
    return Object.keys(this.poolTokens).length > 0;
  }
}
