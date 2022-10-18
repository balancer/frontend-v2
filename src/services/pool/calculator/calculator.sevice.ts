import { getAddress } from '@ethersproject/address';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';
import OldBigNumber from 'bignumber.js';
import { Ref, ref } from 'vue';

import {
  isComposableStableLike,
  isDeep,
  isStable,
  isStableLike,
} from '@/composables/usePool';
import { bnum, isSameAddress } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import { OnchainTokenDataMap, Pool } from '@/services/pool/types';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { TokenInfoMap } from '@/types/TokenList';

import Stable from './stable';
import StablePhantom from './stable-phantom';
import Weighted from './weighted';

interface Amounts {
  send: string[];
  receive: string[];
  fixedToken: number;
}

export interface PiOptions {
  exactOut?: boolean;
  tokenIndex?: number | null;
  queryBPT?: string;
}

type PoolAction = 'join' | 'exit';

export default class CalculatorService {
  types = ['send', 'receive'];
  weighted: Weighted;
  stable: Stable;
  stablePhantom: StablePhantom;

  constructor(
    public pool: Ref<Pool>,
    public allTokens: Ref<TokenInfoMap>,
    public balances: Ref<BalanceMap>,
    public action: PoolAction,
    public useNativeAsset: Ref<boolean> = ref(false),
    weightedClass = Weighted,
    stableClass = Stable,
    stablePhantomClass = StablePhantom,
    public readonly config = configService
  ) {
    this.weighted = new weightedClass(this);
    this.stable = new stableClass(this);
    this.stablePhantom = new stablePhantomClass(this);
  }

  public priceImpact(
    tokenAmounts: string[],
    opts: PiOptions = { exactOut: false, tokenIndex: 0 }
  ): OldBigNumber {
    if (this.isStableLikePool) {
      if (isDeep(this.pool.value)) {
        return this.stablePhantom.priceImpact(tokenAmounts, opts);
      } else {
        return this.stable.priceImpact(tokenAmounts, opts);
      }
    }
    return this.weighted.priceImpact(tokenAmounts, opts);
  }

  public exactTokensInForBPTOut(tokenAmounts: string[]): OldBigNumber {
    if (this.isStableLikePool) {
      return this.stable.exactTokensInForBPTOut(tokenAmounts);
    }
    return this.weighted.exactTokensInForBPTOut(tokenAmounts);
  }

  public exactBPTInForTokenOut(
    bptAmount: string,
    tokenIndex: number
  ): OldBigNumber {
    if (this.isStableLikePool) {
      return this.stable.exactBPTInForTokenOut(bptAmount, tokenIndex);
    }
    return this.weighted.exactBPTInForTokenOut(bptAmount, tokenIndex);
  }

  public bptInForExactTokenOut(
    amount: string,
    tokenIndex: number
  ): OldBigNumber {
    if (this.isStableLikePool) {
      return this.stable.bptInForExactTokenOut(amount, tokenIndex);
    }
    return this.weighted.bptInForExactTokenOut(amount, tokenIndex);
  }

  public propMax(): Amounts {
    let maxAmounts: Amounts = {
      send: [],
      receive: [],
      fixedToken: 0,
    };
    const type = this.action === 'join' ? 'send' : 'receive';

    this.tokenAddresses.forEach((token, tokenIndex) => {
      let hasBalance = true;
      let balance;
      if (token === this.config.network.nativeAsset.address) {
        balance = bnum(this.balances.value[getAddress(token)])
          .minus(this.config.network.nativeAsset.minTransactionBuffer)
          .toString();
      } else {
        balance = this.balances.value[getAddress(token)] || '0';
      }
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

  /**
   * Calculates proportional amounts in/out given a fixed amount out/in based on
   * the balances and totalSupply of the pool.
   *
   * @param {string} fixedAmount - The fixed amount in/out.
   * @param {number} index - The pool token index for the fixedAmount.
   * @param {string} type - If receive fixedAmount is tokenIn expecting bptOut, if
   * send fixedAmount is bptIn expecting tokensOut.
   */
  public propAmountsGiven(
    fixedAmount: string,
    index: number,
    type: 'send' | 'receive',
    fixedRatioOverride?: {
      bps: number;
      value: string;
      buffer: number;
    }
  ): Amounts {
    if (fixedAmount.trim() === '')
      return { send: [], receive: [], fixedToken: 0 };

    const types = ['send', 'receive'];
    const fixedTokenAddress = this.tokenOf(type, index);
    const fixedToken = this.allTokens.value[fixedTokenAddress];
    const fixedDenormAmount = parseUnits(fixedAmount, fixedToken?.decimals);
    const fixedRatio = this.ratioOf(type, index);
    const amounts = {
      send: this.sendTokens.map(() => ''),
      receive: this.receiveTokens.map(() => ''),
      fixedToken: index,
    };

    amounts[type][index] = fixedAmount;

    [this.sendRatios, this.receiveRatios].forEach((ratios, ratioType) => {
      ratios.forEach((ratio, i) => {
        if (i !== index || type !== types[ratioType]) {
          const tokenAddress = this.tokenOf(types[ratioType], i);
          const token = this.allTokens.value[tokenAddress];
          let amount;
          if (fixedRatioOverride) {
            amount = fixedDenormAmount
              .sub(fixedRatioOverride.buffer)
              .mul(fixedRatioOverride.bps)
              .div(10000)
              .mul(ratio)
              .div(fixedRatioOverride.value);
          } else {
            amount = fixedDenormAmount.mul(ratio).div(fixedRatio);
          }
          amounts[types[ratioType]][i] = formatUnits(amount, token?.decimals);
        }
      });
    });

    return amounts;
  }

  public denormAmounts(amounts: string[], decimals: number[]): BigNumber[] {
    return amounts.map((a, i) => parseUnits(a, decimals[i]));
  }

  public tokenOf(type: string, index: number) {
    return getAddress(this[`${type}Tokens`][index]);
  }

  public ratioOf(type: string, index: number) {
    return this[`${type}Ratios`][index];
  }

  public get tokenAddresses(): string[] {
    if (this.useNativeAsset.value) {
      return this.pool.value.tokensList.map(address => {
        if (isSameAddress(address, this.config.network.addresses.weth))
          return this.config.network.nativeAsset.address;
        return address;
      });
    }
    return this.pool.value.tokensList;
  }

  public get poolTokens(): OnchainTokenDataMap {
    if (!this.pool.value?.onchain?.tokens) return {};
    return this.pool.value.onchain.tokens;
  }

  public get poolTokenBalances(): BigNumber[] {
    if (!this.pool.value?.onchain?.tokens) return [];

    const normalizedBalances = Object.values(this.poolTokens).map(
      t => t.balance
    );
    return normalizedBalances.map((balance, i) =>
      parseUnits(balance, this.poolTokenDecimals[i])
    );
  }

  public get poolTokenDecimals(): number[] {
    return Object.values(this.poolTokens).map(t => t.decimals);
  }

  public get poolTokenWeights(): BigNumber[] {
    const normalizedWeights = Object.values(this.poolTokens).map(t => t.weight);
    return normalizedWeights.map(weight => parseUnits(weight.toString(), 18));
  }

  public get poolTotalSupply(): BigNumber {
    return parseUnits(
      this.pool.value?.onchain?.totalSupply || '0',
      this.poolDecimals
    );
  }

  public get poolSwapFee(): BigNumber {
    return parseUnits(this.pool.value?.onchain?.swapFee || '0', 18);
  }

  public get poolDecimals(): number {
    return this.pool.value?.onchain?.decimals || 18;
  }

  public get bptBalance(): string {
    return this.balances.value[getAddress(this.pool.value.address)];
  }

  public get isStablePool(): boolean {
    return isStable(this.pool.value.poolType);
  }

  public get isStableLikePool(): boolean {
    return isStableLike(this.pool.value.poolType);
  }

  public get isComposableStableLikePool(): boolean {
    return isComposableStableLike(this.pool.value.poolType);
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
