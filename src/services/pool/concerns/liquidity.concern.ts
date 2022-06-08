import {
  Liquidity,
  Pool,
  StaticPoolProvider,
  StaticTokenPriceProvider,
  StaticTokenProvider,
  Token
} from '@balancer-labs/sdk';
import { getAddress } from '@ethersproject/address';
import { formatUnits } from 'ethers/lib/utils';
import { Address } from 'paraswap';

import {
  isStableLike,
  isStablePhantom,
  isWeightedLike
} from '@/composables/usePool';
import { FiatCurrency } from '@/constants/currency';
import { bnum } from '@/lib/utils';
import {
  AnyPool,
  LinearPoolDataMap,
  OnchainTokenData,
  PoolToken
} from '@/services/balancer/subgraph/types';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { configService } from '@/services/config/config.service';

interface OnchainTokenInfo extends OnchainTokenData {
  address: string;
}

function convertLinearPoolDataMapToPools(
  linearPoolDataMap: LinearPoolDataMap,
  decimalsMap: Record<Address, number>
): Pool[] {
  if (!linearPoolDataMap) return [];
  // const tokensMap = getTokens(
  //   Object.keys(decoratedPool.linearPoolTokensMap)
  // );
  return Object.entries(linearPoolDataMap).map(([address, data]) => {
    const mainTokenBalance = formatUnits(
      data.mainToken.balance,
      decimalsMap[data.mainToken.address]
    );

    const wrappedTokenBalance = formatUnits(
      data.wrappedToken.balance,
      decimalsMap[data.wrappedToken.address]
    );
    return {
      id: data.id,
      address: address,
      poolType: 'AaveLinear',
      swapFee: '',
      tokens: [
        {
          address: data.mainToken.address,
          decimals: decimalsMap[data.mainToken.address] || 18,
          balance: mainTokenBalance,
          weight: null,
          priceRate: '1'
        },
        {
          address: data.wrappedToken.address,
          decimals: decimalsMap[data.wrappedToken.address] || 18,
          balance: wrappedTokenBalance,
          weight: null,
          priceRate: data.wrappedToken.priceRate
        }
      ],
      tokensList: [data.mainToken.address, data.wrappedToken.address],
      totalShares: data.totalSupply
    };
  });
}

export default class LiquidityConcern {
  poolTokens: OnchainTokenInfo[] | PoolToken[];

  constructor(public pool: AnyPool, private readonly poolType = pool.poolType) {
    this.poolTokens = this.onchainPoolTokens || this.pool.tokens;
  }

  public async calcTotal(
    prices: TokenPrices,
    currency: FiatCurrency
  ): Promise<string> {
    if (!this.hasPoolTokens) throw new Error('Missing onchain pool token data');

    const decimalsMap = {};
    if (this.pool.linearPoolTokensMap) {
      Object.entries(this.pool.linearPoolTokensMap).forEach(
        ([address, data]) => {
          decimalsMap[address] = data.decimals;
        }
      );
    }
    const subPools = convertLinearPoolDataMapToPools(
      this.pool.onchain?.linearPools || {},
      decimalsMap
    );
    const tokenPriceProvider = new StaticTokenPriceProvider(prices);
    const poolProvider = new StaticPoolProvider(
      [this.pool as Pool].concat(subPools)
    );
    const subPoolTokens: Token[] = subPools.reduce((tokens, subPool) => {
      return tokens.concat(subPool.tokens);
    }, [] as Token[]);
    const allTokens: Token[] = (this.poolTokens as Token[]).concat(
      subPoolTokens
    );
    const tokenProvider = new StaticTokenProvider(allTokens);
    const liquidity = new Liquidity(
      {
        network: configService.network.chainId,
        rpcUrl: configService.rpc
      },
      poolProvider,
      tokenProvider,
      tokenPriceProvider
    );

    if (isWeightedLike(this.poolType)) {
      const newTotal = await liquidity.getLiquidity(this.pool);
      console.log('New weighted total (' + this.pool.id + '): ', newTotal);
      const total = this.calcWeightedTotal(prices, currency);
      console.log('Old Weighted total (' + this.pool.id + '): ', total);
      return total;
    } else if (isStableLike(this.poolType)) {
      const newTotal = await liquidity.getLiquidity(this.pool);
      console.log('New stable total (' + this.pool.id + '): ', newTotal);
      const total = this.calcStableTotal(prices, currency);
      console.log('Old stable total (' + this.pool.id + '): ', total);
      return total;
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
    let tokens = this.pool.tokens;

    if (
      isStablePhantom(this.poolType) &&
      this.pool.linearPoolTokensMap != null
    ) {
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
      console.log(
        'balance: ',
        balance,
        ' price ',
        price,
        ' value ',
        value.toString()
      );
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

  private get onchainPoolTokens(): OnchainTokenInfo[] | null {
    if (this.pool.onchain) {
      const tokenMap = this.pool.onchain.tokens;
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
}
