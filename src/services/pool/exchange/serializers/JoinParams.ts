import PoolExchange from '..';
import { encodeJoinStablePool } from '@/lib/utils/balancer/stablePoolEncoding';
import { encodeJoinWeightedPool } from '@/lib/utils/balancer/weightedPoolEncoding';
import { parseUnits } from '@ethersproject/units';
import { BigNumberish } from '@ethersproject/bignumber';
import { isManaged, isStableLike } from '@/composables/usePool';

export default class JoinParams {
  private exchange: PoolExchange;
  private isStableLikePool: boolean;
  private isManagedPool: boolean;
  private isSwapEnabled: boolean;
  private dataEncodeFn: (data: any) => string;
  private fromInternalBalance = false;

  constructor(exchange: PoolExchange) {
    this.exchange = exchange;
    this.isStableLikePool = isStableLike(exchange.pool.poolType);
    this.isManagedPool = isManaged(exchange.pool.poolType);
    this.isSwapEnabled =
      this.isManagedPool && exchange.pool.onchain.swapEnabled;
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
    const parsedBptOut = parseUnits(
      bptOut,
      this.exchange.pool.onchain.decimals
    );
    const txData = this.txData(parsedAmountsIn, parsedBptOut);

    return [
      this.exchange.pool.id,
      account,
      account,
      {
        assets: this.exchange.pool.tokenAddresses,
        maxAmountsIn: parsedAmountsIn,
        userData: txData,
        fromInternalBalance: this.fromInternalBalance
      }
    ];
  }

  private parseAmounts(amounts: string[]): BigNumberish[] {
    return amounts.map((amount, i) => {
      const token = this.exchange.pool.tokenAddresses[i];
      return parseUnits(
        amount,
        this.exchange.pool.onchain.tokens[token].decimals
      );
    });
  }

  private txData(amountsIn: BigNumberish[], minimumBPT: BigNumberish): string {
    if (this.exchange.pool.onchain.totalSupply === '0') {
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
