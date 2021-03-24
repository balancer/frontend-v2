import { Token } from '@/types';
import { Pool } from '@/utils/balancer/types';
import { parseUnits, formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { bnum } from '@/utils';

interface Amounts {
  send: string[];
  receive: string[];
  fixedToken: number;
}

export default class Calculator {
  pool: Pool;
  allTokens: Token[];
  types = ['send', 'receive'];
  action: 'join' | 'exit';

  constructor(pool, allTokens, action) {
    this.pool = pool;
    this.allTokens = allTokens;
    this.action = action;
  }

  public propMax(): Amounts {
    let maxAmounts: Amounts = { send: [], receive: [], fixedToken: 0 };
    const type = this.action === 'join' ? 'send' : 'receive';

    this.pool.tokens.forEach((token, tokenIndex) => {
      let hasBalance = true;
      const balance = this.allTokens[token].balance.toString();
      const amounts = this.propAmountsGiven(balance, tokenIndex, type);

      amounts.send.forEach((amount, amountIndex) => {
        const greaterThanBalance =
          parseFloat(amount) >
          this.allTokens[this.tokenOf(type, amountIndex)].balance;
        if (greaterThanBalance) hasBalance = false;
      });

      if (hasBalance) {
        const currentMaxAmount = parseFloat(maxAmounts.send[tokenIndex] || '0');
        const thisAmount = parseFloat(amounts.send[tokenIndex]);
        if (thisAmount > currentMaxAmount) {
          maxAmounts = amounts;
          maxAmounts.fixedToken = tokenIndex;
        }
      }
    });

    return maxAmounts;
  }

  public propAmountsGiven(
    fixedAmount: string,
    index: number,
    type: 'send' | 'receive'
  ): Amounts {
    if (fixedAmount.trim() === '')
      return { send: [], receive: [], fixedToken: 0 };

    const types = ['send', 'receive'];
    const fixedTokenAddress = this.tokenOf(type, index);
    const fixedToken = this.allTokens[fixedTokenAddress];
    const fixedDenormAmount = parseUnits(fixedAmount, fixedToken.decimals);
    const fixedRatio = this.ratioOf(type, index);
    const amounts = {
      send: this.sendTokens.map(() => ''),
      receive: this.receiveTokens.map(() => ''),
      fixedToken: fixedTokenAddress
    };

    amounts[type][index] = fixedAmount;

    [this.sendRatios, this.receiveRatios].forEach((ratios, ratioType) => {
      ratios.forEach((ratio, i) => {
        if (i !== index || type !== types[ratioType]) {
          const tokenAddress = this.tokenOf(types[ratioType], i);
          const token = this.allTokens[tokenAddress];
          amounts[types[ratioType]][i] = formatUnits(
            fixedDenormAmount.mul(ratio).div(fixedRatio),
            token.decimals
          );
        }
      });
    });

    return amounts;
  }

  public priceImpact(tokenAmounts: string[], currentBPTAmount: string): number {
    const denormBPTAmount = parseUnits(
      currentBPTAmount,
      this.poolDecimals
    ).toString();
    const _currentBPTAmount = bnum(denormBPTAmount);
    const bptSpotAmount = this.bptSpotAmount(tokenAmounts);
    const priceImpact = bnum(1).minus(_currentBPTAmount.div(bptSpotAmount));
    return priceImpact.toNumber();
  }

  public bptSpotAmount(tokenAmounts: string[]): string {
    const denormAmounts: string[] = this.pool.tokens.map((token, i) => {
      return parseUnits(
        tokenAmounts[i],
        this.allTokens[token].decimals
      ).toString();
    });

    const tokenBPTPrices: string[] = this.pool.tokens.map((_, i) => {
      return this.tokenPriceInBPT(i);
    });

    let bptSpot = bnum(0);
    this.pool.tokens.forEach((_, i) => {
      const amount = bnum(denormAmounts[i]);
      bptSpot = bptSpot.plus(amount.div(tokenBPTPrices[i]));
    });

    return bptSpot.toString();
  }

  public tokenPriceInBPT(tokenIndex: number): string {
    const totalSupply: string = this.pool.totalSupply.toString();
    const totalWeight: string = this.pool.weights
      .reduce((a, b) => a.add(b), BigNumber.from(0))
      .toString();
    const weight = bnum(this.pool.weights[tokenIndex].toString());
    const weightFraction = weight.div(totalWeight);
    const balance = bnum(this.pool.poolTokens.balances[tokenIndex].toString());
    const price = balance.div(weightFraction).div(totalSupply);
    return price.toString();
  }

  public setAllTokens(tokens: Token[]): void {
    this.allTokens = tokens;
  }

  private tokenOf(type: string, index: number) {
    return this[`${type}Tokens`][index];
  }

  private ratioOf(type: string, index: number) {
    return this[`${type}Ratios`][index];
  }

  private get poolDecimals() {
    return this.allTokens[this.pool.address].decimals;
  }

  private get sendTokens() {
    if (this.action === 'join') return this.pool.tokens;
    return [this.pool.address];
  }

  private get receiveTokens() {
    if (this.action === 'join') return [this.pool.address];
    return this.pool.tokens;
  }

  private get sendRatios() {
    if (this.action === 'join') return this.pool.tokenBalances;
    return [this.pool.totalSupply];
  }

  private get receiveRatios() {
    if (this.action === 'join') return [this.pool.totalSupply];
    return this.pool.tokenBalances;
  }
}
