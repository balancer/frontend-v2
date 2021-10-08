import PoolExchange from '../exchange.service';
import { encodeJoinStablePool } from '@/lib/utils/balancer/stablePoolEncoding';
import { encodeJoinWeightedPool } from '@/lib/utils/balancer/weightedPoolEncoding';
import { parseUnits } from '@ethersproject/units';
import { BigNumberish } from '@ethersproject/bignumber';
import { Ref } from 'vue';
import { FullPool } from '@/services/balancer/subgraph/types';
import { isManaged, isStableLike } from '@/composables/usePool';

export default class JoinParams {
  private pool: Ref<FullPool>;
  private isStableLikePool: boolean;
  private isManagedPool: boolean;
  private isSwapEnabled: boolean;
  private dataEncodeFn: (data: any) => string;
  private fromInternalBalance = false;

  constructor(exchange: PoolExchange) {
    this.pool = exchange.pool;
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
    bptOut: string
  ): any[] {
    const parsedAmountsIn = this.parseAmounts(amountsIn);
    const parsedBptOut = parseUnits(bptOut, this.pool.value.onchain.decimals);
    const txData = this.txData(parsedAmountsIn, parsedBptOut);

    return [
      this.pool.value.id,
      account,
      account,
      {
        assets: this.pool.value.tokenAddresses,
        maxAmountsIn: parsedAmountsIn,
        userData: txData,
        fromInternalBalance: this.fromInternalBalance
      }
    ];
  }

  private parseAmounts(amounts: string[]): BigNumberish[] {
    return amounts.map((amount, i) => {
      const token = this.pool.value.tokenAddresses[i];
      return parseUnits(amount, this.pool.value.onchain.tokens[token].decimals);
    });
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
