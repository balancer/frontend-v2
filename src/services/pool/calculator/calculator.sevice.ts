import BigNumber from 'bignumber.js';
import { parseUnits, formatUnits } from '@ethersproject/units';
import { BigNumberish } from '@ethersproject/bignumber';
import { FullPool } from '@/services/balancer/subgraph/types';
import Weighted from './weighted';
import Stable from './stable';
import { TokenInfoMap } from '@/types/TokenList';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { Ref, ref } from 'vue';
import { isStable, isStableLike } from '@/composables/usePool';
import { bnum } from '@/lib/utils';
import { configService } from '@/services/config/config.service';

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

export default class CalculatorService {
  types = ['send', 'receive'];
  weighted: Weighted;
  stable: Stable;

  constructor(
    public pool: Ref<FullPool>,
    public allTokens: Ref<TokenInfoMap>,
    public balances: Ref<BalanceMap>,
    public action: PoolAction,
    public useNativeAsset: Ref<boolean> = ref(false),
    weightedClass = Weighted,
    stableClass = Stable,
    public readonly config = configService
  ) {
    this.weighted = new weightedClass(this);
    this.stable = new stableClass(this);
  }

  public priceImpact(
    tokenAmounts: string[],
    opts: PiOptions = { exactOut: false, tokenIndex: 0 }
  ): BigNumber {
    if (this.isStableLikePool) {
      return this.stable.priceImpact(tokenAmounts, opts);
    }
    return this.weighted.priceImpact(tokenAmounts, opts);
  }

  public exactTokensInForBPTOut(tokenAmounts: string[]): BigNumber {
    if (this.isStableLikePool) {
      return this.stable.exactTokensInForBPTOut(tokenAmounts);
    }
    return this.weighted.exactTokensInForBPTOut(tokenAmounts);
  }

  public exactBPTInForTokenOut(
    bptAmount: string,
    tokenIndex: number
  ): BigNumber {
    if (this.isStableLikePool) {
      return this.stable.exactBPTInForTokenOut(bptAmount, tokenIndex);
    }
    return this.weighted.exactBPTInForTokenOut(bptAmount, tokenIndex);
  }

  public bptInForExactTokenOut(amount: string, tokenIndex: number): BigNumber {
    if (this.isStableLikePool) {
      return this.stable.bptInForExactTokenOut(amount, tokenIndex);
    }
    return this.weighted.bptInForExactTokenOut(amount, tokenIndex);
  }

  public propMax(): Amounts {
    let maxAmounts: Amounts = {
      send: [],
      receive: [],
      fixedToken: 0
    };
    const type = this.action === 'join' ? 'send' : 'receive';

    this.tokenAddresses.forEach((token, tokenIndex) => {
      let hasBalance = true;
      const balance = this.balances.value[token] || '0';
      const amounts = this.propAmountsGiven(balance, tokenIndex, type);

      amounts.send.forEach((amount, amountIndex) => {
        const greaterThanBalance = bnum(amount).gt(
          this.balances.value[this.tokenOf(type, amountIndex)]
        );
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
    const fixedToken = this.allTokens.value[fixedTokenAddress];
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
          const token = this.allTokens.value[tokenAddress];
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

  public get tokenAddresses(): string[] {
    if (this.useNativeAsset.value) {
      return this.pool.value.tokenAddresses.map(address => {
        if (address === this.config.network.addresses.weth)
          return this.config.network.nativeAsset.address;
        return address;
      });
    }
    return this.pool.value.tokenAddresses;
  }

  public get poolTokenBalances(): BigNumberish[] {
    const normalizedBalances = Object.values(
      this.pool.value.onchain.tokens
    ).map(t => t.balance);
    return normalizedBalances.map((balance, i) =>
      parseUnits(balance, this.poolTokenDecimals[i])
    );
  }

  public get poolTokenDecimals(): number[] {
    return Object.values(this.pool.value.onchain.tokens).map(t => t.decimals);
  }

  public get poolTokenWeights(): BigNumberish[] {
    const normalizedWeights = Object.values(this.pool.value.onchain.tokens).map(
      t => t.weight
    );
    return normalizedWeights.map(weight => parseUnits(weight.toString(), 18));
  }

  public get poolTotalSupply(): BigNumberish {
    return parseUnits(this.pool.value.onchain.totalSupply, this.poolDecimals);
  }

  public get poolSwapFee(): BigNumberish {
    return parseUnits(this.pool.value.onchain.swapFee, 18);
  }

  public get poolDecimals(): number {
    return this.pool.value.onchain.decimals;
  }

  public get bptBalance(): string {
    return this.balances.value[this.pool.value.address];
  }

  public get isStablePool(): boolean {
    return isStable(this.pool.value.poolType);
  }

  public get isStableLikePool(): boolean {
    return isStableLike(this.pool.value.poolType);
  }

  public get sendTokens(): string[] {
    if (this.action === 'join') return this.tokenAddresses;
    return [this.pool.value.address];
  }

  public get receiveTokens(): string[] {
    if (this.action === 'join') return [this.pool.value.address];
    return this.tokenAddresses;
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
