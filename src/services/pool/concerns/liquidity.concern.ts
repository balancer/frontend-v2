import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';

import { isStableLike, isWeightedLike, isDeep } from '@/composables/usePool';
import { FiatCurrency } from '@/constants/currency';
import { bnum, isSameAddress } from '@/lib/utils';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { AnyPool, OnchainTokenData, PoolToken } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';

interface OnchainTokenInfo extends OnchainTokenData {
  address: string;
}

export default class LiquidityConcern {
  poolTokens: OnchainTokenInfo[] | PoolToken[];

  constructor(
    public readonly pool: AnyPool,
    private readonly poolType = pool.poolType
  ) {
    this.poolTokens = this.onchainPoolTokens || this.pool.tokens;
  }

  public calcTotal(
    prices: TokenPrices,
    currency: FiatCurrency,
    tokenMeta: TokenInfoMap = {}
  ): string {
    if (!this.hasPoolTokens) throw new Error('Missing pool token data');

    if (isWeightedLike(this.poolType)) {
      return this.calcWeightedTotal(prices, currency);
    } else if (isStableLike(this.poolType)) {
      if (isDeep(this.pool)) {
        return this.calcStablePhantom(prices, currency, tokenMeta);
      }
      return this.calcStableTotal(prices, currency);
    }

    return '0';
  }

  private get hasPoolTokens(): boolean {
    return Object.keys(this.poolTokens).length > 0;
  }

  private get onchainPoolTokens(): OnchainTokenInfo[] | null {
    if (this.pool.onchain) {
      const tokenMap = this.pool.onchain.tokens;
      const addresses = Object.keys(tokenMap);
      const tokens = Object.values(tokenMap);
      return tokens.map<OnchainTokenInfo>(
        (token: OnchainTokenData, i: number) => ({
          ...token,
          address: addresses[i],
        })
      );
    }
    return null;
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
    let tokens = this.poolTokens as PoolToken[];
    tokens = tokens.filter(
      token => !isSameAddress(token.address, this.pool.address)
    );

    if (isDeep(this.pool) && this.pool.linearPoolTokensMap != null) {
      tokens = Object.values(this.pool.linearPoolTokensMap);
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

  private calcStablePhantom(
    prices: TokenPrices,
    currency: FiatCurrency,
    tokenMeta: TokenInfoMap
  ): string {
    let totalLiquidity = bnum(0);

    Object.entries(this.pool?.onchain?.linearPools || {}).forEach(
      ([address, token]) => {
        const tokenShare = bnum(
          this.pool?.onchain?.tokens?.[address]?.balance || '0'
        ).div(token.totalSupply);

        const mainTokenBalance = formatUnits(
          token.mainToken.balance,
          tokenMeta[getAddress(token.mainToken.address)]?.decimals
        );

        const wrappedTokenBalance = formatUnits(
          token.wrappedToken.balance,
          tokenMeta[getAddress(token.wrappedToken.address)]?.decimals
        );

        const mainTokenPrice =
          prices[token.mainToken.address] != null
            ? prices[token.mainToken.address].usd
            : null;

        if (mainTokenPrice != null) {
          const mainTokenValue = bnum(mainTokenBalance)
            .times(tokenShare)
            .times(mainTokenPrice);

          const wrappedTokenValue = bnum(wrappedTokenBalance)
            .times(tokenShare)
            .times(mainTokenPrice)
            .times(token.wrappedToken.priceRate);

          totalLiquidity = bnum(totalLiquidity)
            .plus(mainTokenValue)
            .plus(wrappedTokenValue);
        }
      }
    );

    return totalLiquidity.toString();
  }
}
