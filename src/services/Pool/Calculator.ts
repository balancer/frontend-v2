import { Token } from '@/types';
import { Pool } from '@/utils/balancer/types';
import { parseUnits, formatUnits } from '@ethersproject/units';

interface Amounts {
  send: string[];
  receive: string[];
  fixedToken: string;
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
    let maxAmounts: Amounts = { send: [], receive: [], fixedToken: '' };
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
          maxAmounts.fixedToken = token;
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
      return { send: [], receive: [], fixedToken: '' };

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

  public setAllTokens(tokens: Token[]): void {
    this.allTokens = tokens;
  }

  private tokenOf(type: string, index: number) {
    return this[`${type}Tokens`][index];
  }

  private ratioOf(type: string, index: number) {
    return this[`${type}Ratios`][index];
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
