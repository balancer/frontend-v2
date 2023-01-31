import { getAddress } from '@ethersproject/address';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';
// import OldBigNumber from 'bignumber.js';
import { Ref, ref } from 'vue';

import {
  // isComposableStableLike,
  // isDeep,
  // isStable,
  // isStableLike,
  tokensListExclBpt,
} from '@/composables/usePool';
import { bnum, isSameAddress } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import { OnchainTokenDataMap, Pool } from '@/services/pool/types';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { TokenInfoMap } from '@/types/TokenList';
import { AmountIn } from '@/providers/local/join-pool.provider';

// import Stable from './stable';
// import StablePhantom from './stable-phantom';
// import Weighted from './weighted';

// interface Amounts {
//   send: string[];
//   // receive: string[];
//   fixedToken: number;
// }

// export interface PiOptions {
//   exactOut?: boolean;
//   tokenIndex?: number | null;
//   queryBPT?: string;
// }

// type PoolAction = 'join';

export default class NewCalculatorService {
  // types = ['send'];
  // weighted: Weighted;
  // stable: Stable;
  // stablePhantom: StablePhantom;

  constructor(
    public pool: Ref<Pool>,
    public allTokens: Ref<TokenInfoMap>,
    public balances: Ref<BalanceMap>,
    // public action: PoolAction,
    public useNativeAsset: Ref<boolean> = ref(false),

    public readonly config = configService
  ) {
    // this.weighted = new weightedClass(this);
    // this.stable = new stableClass(this);
    // this.stablePhantom = new stablePhantomClass(this);
  }

  // public priceImpact(
  //   tokenAmounts: string[],
  //   opts: PiOptions = { exactOut: false, tokenIndex: 0 }
  // ): OldBigNumber {
  //   if (this.isStableLikePool) {
  //     if (isDeep(this.pool.value)) {
  //       return this.stablePhantom.priceImpact(tokenAmounts, opts);
  //     } else {
  //       return this.stable.priceImpact(tokenAmounts, opts);
  //     }
  //   }
  //   return this.weighted.priceImpact(tokenAmounts, opts);
  // }

  // public exactTokensInForBPTOut(tokenAmounts: string[]): OldBigNumber {
  //   if (this.isStableLikePool) {
  //     return this.stable.exactTokensInForBPTOut(tokenAmounts);
  //   }
  //   return this.weighted.exactTokensInForBPTOut(tokenAmounts);
  // }

  // public exactBPTInForTokenOut(
  //   bptAmount: string,
  //   tokenIndex: number
  // ): OldBigNumber {
  //   if (this.isStableLikePool) {
  //     return this.stable.exactBPTInForTokenOut(bptAmount, tokenIndex);
  //   }
  //   return this.weighted.exactBPTInForTokenOut(bptAmount, tokenIndex);
  // }

  // public bptInForExactTokenOut(
  //   amount: string,
  //   tokenIndex: number
  // ): OldBigNumber {
  //   if (this.isStableLikePool) {
  //     return this.stable.bptInForExactTokenOut(amount, tokenIndex);
  //   }
  //   return this.weighted.bptInForExactTokenOut(amount, tokenIndex);
  // }

  public propMax(): AmountIn[] {
    let maxAmounts: AmountIn[] = Object.keys(this.allTokens.value).map(
      address => {
        return {
          address,
          valid: true,
          value: '0',
        };
      }
    );
    // let fixedTokenIndex = 0;
    // const type = 'send';

    this.tokenAddresses.forEach((token, tokenIndex) => {
      let hasBalance = true;
      let balance;
      if (isSameAddress(token, this.config.network.nativeAsset.address)) {
        balance = bnum(this.balances.value[getAddress(token)])
          .minus(this.config.network.nativeAsset.minTransactionBuffer)
          .toString();
      } else {
        balance = this.balances.value[getAddress(token)] || '0';
      }
      const amounts: AmountIn[] = this.propAmountsGiven(balance, tokenIndex);

      amounts.forEach((amount, amountIndex) => {
        const greaterThanBalance = bnum(amount.value).gt(
          this.balances.value[this.tokenOf(amountIndex)]
        );
        if (greaterThanBalance) hasBalance = false;
      });

      if (hasBalance) {
        const currentMaxAmount = parseFloat(
          maxAmounts[tokenIndex].value || '0'
        );
        const thisAmount = parseFloat(amounts[tokenIndex].value);
        if (thisAmount > currentMaxAmount) {
          maxAmounts = amounts;
          // fixedTokenIndex = tokenIndex;
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
   */
  public propAmountsGiven(
    fixedAmount: string,
    index: number,
    // type: 'send',
    fixedRatioOverride?: {
      bps: number;
      value: string;
      buffer: number;
    }
  ): AmountIn[] {
    if (fixedAmount.trim() === '') return [];

    // const types = ['send'];
    const fixedTokenAddress = this.tokenOf(index);
    const fixedToken = this.allTokens.value[fixedTokenAddress];
    const fixedDenormAmount = parseUnits(fixedAmount, fixedToken?.decimals);
    const fixedRatio = this.ratioOf(index);
    const amounts: AmountIn[] = this.sendTokens.map(token => {
      return {
        address: token,
        valid: true,
        value: '0',
      };
    });

    // {
    //   send: this.sendTokens.map(() => ''),
    //   // receive: this.receiveTokens.map(() => ''),
    //   fixedToken: index,
    // };

    amounts[index].value = fixedAmount;

    // [this.sendRatios].forEach((ratios, ratioType) => {
    this.sendRatios.forEach((ratio, i) => {
      if (i !== index) {
        const tokenAddress = this.tokenOf(i);
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
        amounts[i].value = formatUnits(amount, token?.decimals);
      }
      // });
    });

    return amounts;
  }

  // public denormAmounts(amounts: string[], decimals: number[]): BigNumber[] {
  //   return amounts.map((a, i) => parseUnits(a, decimals[i]));
  // }

  public tokenOf(index: number) {
    return getAddress(this.sendTokens[index]);
  }

  public ratioOf(index: number) {
    return this.sendRatios[index];
  }

  public get tokenAddresses(): string[] {
    const tokensList = tokensListExclBpt(this.pool.value);
    if (this.useNativeAsset.value) {
      return tokensList.map(address => {
        if (isSameAddress(address, this.config.network.addresses.weth))
          return this.config.network.nativeAsset.address;
        return address;
      });
    }
    return tokensList;
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

  // public get poolSwapFee(): BigNumber {
  //   return parseUnits(this.pool.value?.onchain?.swapFee || '0', 18);
  // }

  public get poolDecimals(): number {
    return this.pool.value?.onchain?.decimals || 18;
  }

  // public get bptBalance(): string {
  //   return this.balances.value[getAddress(this.pool.value.address)];
  // }

  // public get isStablePool(): boolean {
  //   return isStable(this.pool.value.poolType);
  // }

  // public get isStableLikePool(): boolean {
  //   return isStableLike(this.pool.value.poolType);
  // }

  // public get isComposableStableLikePool(): boolean {
  //   return isComposableStableLike(this.pool.value.poolType);
  // }

  public get sendTokens(): string[] {
    return this.tokenAddresses;
  }

  // public get receiveTokens(): string[] {
  //   if (this.action === 'join') return [this.pool.value.address];
  //   return this.tokenAddresses;
  // }

  public get sendRatios(): BigNumberish[] {
    return this.poolTokenBalances;
  }

  // public get receiveRatios(): BigNumberish[] {
  //   if (this.action === 'join') return [this.poolTotalSupply];
  //   return this.poolTokenBalances;
  // }
}
