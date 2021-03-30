import { Token } from '@/types';
import { Pool } from '@/utils/balancer/types';
import { parseUnits, formatUnits } from '@ethersproject/units';
import { bnum } from '@/utils';
import BigNumber from 'bignumber.js';
import {
  exactTokensInForBPTOut,
  bptInForExactTokensOut,
  exactBPTInForTokenOut,
  bptForTokensZeroPriceImpact
} from './helpers/math/weighted';
import {
  bnum as fpBnum,
  FixedPoint as FpBigNumber
} from '@/utils/balancer/helpers/sor/FixedPoint';
import { BigNumberish } from '@ethersproject/bignumber';

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

  public setAllTokens(tokens: Token[]): void {
    this.allTokens = tokens;
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
      fixedToken: index
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

  public priceImpact(tokenAmounts: string[], exactOut = false, tokenIndex = 0): BigNumber {
    let bptAmount, bptZeroPriceImpact;

    if (this.action === 'join') {
      bptAmount = this.exactTokensInForBPTOut(tokenAmounts);
      bptZeroPriceImpact = this.bptForTokensZeroPriceImpact(tokenAmounts);

      return bnum(1).minus(bptAmount.div(bptZeroPriceImpact));
    } else { // Single asset exit
      if (exactOut) {
        bptAmount = this.bptInForExactTokensOut(tokenAmounts)
        bptZeroPriceImpact = this.bptForTokensZeroPriceImpact(tokenAmounts);
      } else {
        bptAmount = parseUnits(this.bptBalance, this.poolDecimals).toString();
        tokenAmounts = this.pool.tokens.map((_, i) => {
          if (i !== tokenIndex) return '0';
          const tokenAmount = this.exactBPTInForTokenOut(bptAmount, tokenIndex).toString();
          return formatUnits(tokenAmount, this.poolTokenDecimals[tokenIndex]).toString();
        })
        bptZeroPriceImpact = this.bptForTokensZeroPriceImpact(tokenAmounts);
      }

      return bnum(bptAmount).div(bptZeroPriceImpact).minus(1);
    }
  }

  private exactTokensInForBPTOut(tokenAmounts: string[]): FpBigNumber {
    const balances = this.poolTokenBalances.map(b => fpBnum(b.toString()));
    const weights = this.poolTokenWeights.map(w => fpBnum(w.toString()));
    const denormAmounts = this.denormAmounts(
      tokenAmounts,
      this.poolTokenDecimals
    );
    const amounts = denormAmounts.map(a => fpBnum(a.toString()));

    return exactTokensInForBPTOut(
      balances,
      weights,
      amounts,
      fpBnum(this.poolTotalSupply.toString()),
      fpBnum(this.poolSwapFee.toString())
    );
  }

  private bptInForExactTokensOut(tokenAmounts: string[]): FpBigNumber {
    const balances = this.poolTokenBalances.map(b => fpBnum(b.toString()));
    const weights = this.poolTokenWeights.map(w => fpBnum(w.toString()));
    const denormAmounts = this.denormAmounts(
      tokenAmounts,
      this.poolTokenDecimals
    );
    const amounts = denormAmounts.map(a => fpBnum(a.toString()));

    return bptInForExactTokensOut(
      balances,
      weights,
      amounts,
      fpBnum(this.poolTotalSupply.toString()),
      fpBnum(this.poolSwapFee.toString())
    );
  }

  private exactBPTInForTokenOut(bptAmount: string, tokenIndex: number): FpBigNumber {
    const tokenBalance = fpBnum(this.poolTokenBalances[tokenIndex].toString());
    const tokenNormalizedWeight = fpBnum(this.poolTokenWeights[tokenIndex].toString());
    const bptAmountIn = fpBnum(bptAmount);

    return exactBPTInForTokenOut(
      tokenBalance,
      tokenNormalizedWeight,
      bptAmountIn,
      fpBnum(this.poolTotalSupply.toString()),
      fpBnum(this.poolSwapFee.toString())
    )
  }

  private bptForTokensZeroPriceImpact(tokenAmounts: string[]): BigNumber {
    const denormAmounts = this.denormAmounts(
      tokenAmounts,
      this.poolTokenDecimals
    );
    const amounts = denormAmounts.map(a => bnum(a.toString()));
    
    return bptForTokensZeroPriceImpact(
      this.poolTokenBalances.map(b => bnum(b.toString())),
      this.poolTokenDecimals,
      this.poolTokenWeights.map(w => bnum(w.toString())),
      amounts,
      bnum(this.poolTotalSupply.toString())
    );
  }

  private denormAmounts(amounts: string[], decimals: number[]): BigNumberish[] {
    return amounts.map((a, i) => parseUnits(a, decimals[i]));
  }

  private tokenOf(type: string, index: number) {
    return this[`${type}Tokens`][index];
  }

  private ratioOf(type: string, index: number) {
    return this[`${type}Ratios`][index];
  }

  private get poolTokenBalances(): BigNumberish[] {
    return this.pool.poolTokens.balances;
  }

  private get poolTokenDecimals(): number[] {
    return this.pool.tokens.map(t => this.allTokens[t].decimals);
  }

  private get poolTokenWeights(): BigNumberish[] {
    return this.pool.weights;
  }

  private get poolTotalSupply(): BigNumberish {
    return this.pool.totalSupply;
  }

  private get poolSwapFee(): BigNumberish {
    return this.pool.strategy.swapFee;
  }

  private get poolDecimals(): number {
    return this.allTokens[this.pool.address].decimals;
  }

  private get bptBalance(): string {
    return this.allTokens[this.pool.address].balance;
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
