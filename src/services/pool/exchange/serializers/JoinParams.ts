import PoolExchange from '..';
import { encodeJoinStablePool } from '@/lib/utils/balancer/stablePoolEncoding';
import { encodeJoinWeightedPool } from '@/lib/utils/balancer/weightedPoolEncoding';
import { parseUnits } from '@ethersproject/units';
import { BigNumberish } from '@ethersproject/bignumber';
import { isStable } from '@/composables/usePool';

export default class JoinParams {
  private exchange: PoolExchange;
  private isStablePool: boolean;
  private dataEncodeFn: (data: any) => string;
  private fromInternalBalance = false;

  constructor(exchange) {
    this.exchange = exchange;
    this.isStablePool = isStable(exchange.pool);
    this.dataEncodeFn = this.isStablePool
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
      return this.dataEncodeFn({
        kind: 'ExactTokensInForBPTOut',
        amountsIn,
        minimumBPT
      });
    }
  }
}
