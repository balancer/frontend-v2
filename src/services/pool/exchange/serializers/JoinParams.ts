import PoolExchange from '..';
import { encodeJoinStablePool } from '@/lib/utils/balancer/stablePoolEncoding';
import { encodeJoinWeightedPool } from '@/lib/utils/balancer/weightedPoolEncoding';
import { parseUnits } from '@ethersproject/units';
import { BigNumberish } from '@ethersproject/bignumber';
import { isInvestment, isStable } from '@/composables/usePool';

export default class JoinParams {
  private exchange: PoolExchange;
  private isStablePool: boolean;
  private isInvestmentPool: boolean;
  private isSwapEnabled: boolean;
  private dataEncodeFn: (data: any) => string;
  private fromInternalBalance = false;

  constructor(exchange: PoolExchange) {
    this.exchange = exchange;
    this.isStablePool = isStable(exchange.pool.poolType);
    this.isInvestmentPool = isInvestment(exchange.pool.poolType);
    this.isSwapEnabled = !!(this.isInvestmentPool && exchange.pool.swapEnabled);
    this.dataEncodeFn = this.isStablePool
      ? encodeJoinStablePool
      : encodeJoinWeightedPool;
  }

  public serialize(
    account: string,
    amountsIn: string[],
    bptOut: string,
    isProportional: boolean
  ): any[] {
    const parsedAmountsIn = this.parseAmounts(amountsIn);
    const parsedBptOut = parseUnits(
      bptOut,
      this.exchange.pool.onchain.decimals
    );
    const txData = this.txData(parsedAmountsIn, parsedBptOut, isProportional);

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

  private txData(
    amountsIn: BigNumberish[],
    minimumBPT: BigNumberish,
    isProportional: boolean
  ): string {
    if (this.exchange.pool.onchain.totalSupply === '0') {
      return this.dataEncodeFn({ kind: 'Init', amountsIn });
    } else {
      // Investment Pools can only be joined proportionally if trading is hallted
      if (this.isInvestmentPool && isProportional && !this.isSwapEnabled) {
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
