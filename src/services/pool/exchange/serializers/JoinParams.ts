import PoolExchange from '../exchange.service';
import { encodeJoinStablePool } from '@/lib/utils/balancer/stablePoolEncoding';
import { encodeJoinWeightedPool } from '@/lib/utils/balancer/weightedPoolEncoding';
import { parseUnits } from '@ethersproject/units';
import { BigNumberish } from '@ethersproject/bignumber';
import { Ref } from 'vue';
import { FullPool } from '@/services/balancer/subgraph/types';
import { isManaged, isStableLike } from '@/composables/usePool';
import ConfigService from '@/services/config/config.service';
import { AddressZero } from '@ethersproject/constants';

export default class JoinParams {
  private pool: Ref<FullPool>;
  private config: ConfigService;
  private isStableLikePool: boolean;
  private isManagedPool: boolean;
  private isSwapEnabled: boolean;
  private dataEncodeFn: (data: any) => string;
  private fromInternalBalance = false;

  constructor(exchange: PoolExchange) {
    this.pool = exchange.pool;
    this.config = exchange.config;
    this.isStableLikePool = isStableLike(this.pool.value.poolType);
    this.isManagedPool = isManaged(this.pool.value.poolType);
    this.isSwapEnabled =
      this.isManagedPool && this.pool.value.onchain.swapEnabled;
    this.dataEncodeFn = this.isStableLikePool
      ? encodeJoinStablePool
      : encodeJoinWeightedPool;
  }

  public serialize(
    account: string,
    amountsIn: string[],
    tokensIn: string[],
    bptOut: string
  ): any[] {
    const parsedAmountsIn = this.parseAmounts(amountsIn, tokensIn);
    const parsedBptOut = parseUnits(bptOut, this.pool.value.onchain.decimals);
    const txData = this.txData(parsedAmountsIn, parsedBptOut);
    const assets = this.parseTokensIn(tokensIn);

    return [
      this.pool.value.id,
      account,
      account,
      {
        assets,
        maxAmountsIn: parsedAmountsIn,
        userData: txData,
        fromInternalBalance: this.fromInternalBalance
      }
    ];
  }

  public value(amountsIn: string[], tokensIn: string[]): BigNumberish {
    let value = '0';
    const nativeAsset = this.config.network.nativeAsset;

    amountsIn.forEach((amount, i) => {
      if (tokensIn[i] === nativeAsset.address) {
        value = amount;
      }
    });

    return parseUnits(value, nativeAsset.decimals);
  }

  private parseAmounts(amounts: string[], tokensIn: string[]): BigNumberish[] {
    const nativeAsset = this.config.network.nativeAsset;

    return amounts.map((amount, i) => {
      const token = tokensIn[i];
      // In WETH pools, tokenIn can include ETH so we need to check for this
      // and return the correct decimals.
      const decimals =
        nativeAsset.address === token
          ? nativeAsset.decimals
          : this.pool.value.onchain.tokens[token].decimals;

      return parseUnits(amount, decimals);
    });
  }

  private parseTokensIn(tokensIn: string[]): string[] {
    const nativeAsset = this.config.network.nativeAsset;

    return tokensIn.map(address =>
      address === nativeAsset.address ? AddressZero : address
    );
  }

  private txData(amountsIn: BigNumberish[], minimumBPT: BigNumberish): string {
    if (this.pool.value.onchain.totalSupply === '0') {
      return this.dataEncodeFn({ kind: 'Init', amountsIn });
    } else {
      // Managed Pools can only be joined proportionally if trading is halted
      // This code assumes the UI has disabled non-proportional "exact in for BPT out"
      // joins in this case
      if (this.isManagedPool && !this.isSwapEnabled) {
        return this.dataEncodeFn({
          kind: 'AllTokensInForExactBPTOut',
          bptAmountOut: minimumBPT
        });
      } else {
        return this.dataEncodeFn({
          kind: 'ExactTokensInForBPTOut',
          amountsIn,
          minimumBPT
        });
      }
    }
  }
}
