import BigNumber from 'bignumber.js';
import { parseUnits, formatUnits } from '@ethersproject/units';
import { BigNumberish } from '@ethersproject/bignumber';
import { fnum } from '@balancer-labs/sor2/dist/math/lib/fixedPoint';
import { FixedPointNumber } from '@balancer-labs/sor2/dist/math/FixedPointNumber';

import { FullPool } from '@/services/balancer/subgraph/types';

import { TokenMap } from '@/types';

import Weighted from './weighted';

interface Amounts {
  send: string[];
  receive: string[];
  fixedToken: number;
}

export interface PiOptions {
  exactOut: boolean;
  tokenIndex: number | null;
}

type PoolAction = 'join' | 'exit';

export default class Calculator {
  pool: FullPool;
  allTokens: TokenMap;
  action: PoolAction;
  types = ['send', 'receive'];

  constructor(pool: FullPool, allTokens: TokenMap, action: PoolAction) {
    this.pool = pool;
    this.allTokens = allTokens;
    this.action = action;
  }

  public setAllTokens(tokens: TokenMap): void {
    this.allTokens = tokens;
  }

  public setPool(pool: FullPool): void {
    this.pool = pool;
  }

  public priceImpact(
    tokenAmounts: string[],
    opts: PiOptions = { exactOut: false, tokenIndex: 0 }
  ): BigNumber {
    if (this.isStablePool) return new BigNumber(0); // TODO
    return this.weighted.priceImpact(tokenAmounts, opts);
  }

  public exactTokensInForBPTOut(tokenAmounts: string[]): FixedPointNumber {
    if (this.isStablePool) return fnum(0); // TODO
    return this.weighted.exactTokensInForBPTOut(tokenAmounts);
  }

  public exactBPTInForTokenOut(
    bptAmount: string,
    tokenIndex: number
  ): FixedPointNumber {
    if (this.isStablePool) return fnum(0); // TODO
    return this.weighted.exactBPTInForTokenOut(bptAmount, tokenIndex);
  }

  public bptInForExactTokenOut(
    amount: string,
    tokenIndex: number
  ): FixedPointNumber {
    if (this.isStablePool) return fnum(0); // TODO
    return this.weighted.bptInForExactTokenOut(amount, tokenIndex);
  }

  public propMax(): Amounts {
    let maxAmounts: Amounts = { send: [], receive: [], fixedToken: 0 };
    const type = this.action === 'join' ? 'send' : 'receive';

    this.pool.tokenAddresses.forEach((token, tokenIndex) => {
      let hasBalance = true;
      const balance = this.allTokens[token].balance.toString();
      const amounts = this.propAmountsGiven(balance, tokenIndex, type);

      amounts.send.forEach((amount, amountIndex) => {
        const greaterThanBalance =
          Number(amount) >
          Number(this.allTokens[this.tokenOf(type, amountIndex)].balance);
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

  public denormAmounts(amounts: string[], decimals: number[]): BigNumberish[] {
    return amounts.map((a, i) => parseUnits(a, decimals[i]));
  }

  public tokenOf(type: string, index: number) {
    return this[`${type}Tokens`][index];
  }

  public ratioOf(type: string, index: number) {
    return this[`${type}Ratios`][index];
  }

  public get weighted() {
    return new Weighted(this);
  }

  public get poolTokenBalances(): BigNumberish[] {
    const normalizedBalances = Object.values(this.pool.onchain.tokens).map(
      t => t.balance
    );
    return normalizedBalances.map((balance, i) =>
      parseUnits(balance, this.poolTokenDecimals[i])
    );
  }

  public get poolTokenDecimals(): number[] {
    return Object.values(this.pool.onchain.tokens).map(t => t.decimals);
  }

  public get poolTokenWeights(): BigNumberish[] {
    const normalizedWeights = Object.values(this.pool.onchain.tokens).map(
      t => t.weight
    );
    return normalizedWeights.map(weight => parseUnits(weight.toString(), 18));
  }

  public get poolTotalSupply(): BigNumberish {
    return parseUnits(this.pool.onchain.totalSupply, this.poolDecimals);
  }

  public get poolSwapFee(): BigNumberish {
    return parseUnits(this.pool.onchain.swapFee, 18);
  }

  public get poolDecimals(): number {
    return this.pool.onchain.decimals;
  }

  public get bptBalance(): string {
    return this.allTokens[this.pool.address].balance;
  }

  public get isStablePool(): boolean {
    return this.pool.poolType === 'Stable';
  }

  public get sendTokens(): string[] {
    if (this.action === 'join') return this.pool.tokenAddresses;
    return [this.pool.address];
  }

  public get receiveTokens(): string[] {
    if (this.action === 'join') return [this.pool.address];
    return this.pool.tokenAddresses;
  }

  public get sendRatios(): BigNumberish[] {
    if (this.action === 'join') return this.poolTokenBalances;
    return [this.poolTotalSupply];
  }

  public get receiveRatios(): BigNumberish[] {
    if (this.action === 'join') return [this.poolTotalSupply];
    return this.poolTokenBalances;
  }
}
