import PoolExchange from '../Exchange';
import { encodeJoinStablePool } from '@/utils/balancer/stablePoolEncoding';
import { encodeJoinWeightedPool } from '@/utils/balancer/weightedPoolEncoding';
import { parseUnits } from '@ethersproject/units';
import { BigNumberish } from '@ethersproject/bignumber';

export default class JoinParams {
  private exchange: PoolExchange;
  private isStablePool: boolean;
  private dataEncodeFn: Function;
  private fromInternalBalance = false;

  constructor(exchange) {
    this.exchange = exchange;
    this.isStablePool = exchange.pool.strategy.name === 'stablePool';
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
      this.exchange.tokens[this.exchange.pool.address].decimals
    );
    const txData = this.txData(parsedAmountsIn, parsedBptOut);

    return [
      this.exchange.pool.id,
      account,
      account,
      this.exchange.pool.tokens,
      parsedAmountsIn,
      this.fromInternalBalance,
      txData
    ];
  }

  private parseAmounts(amounts: string[]): BigNumberish[] {
    return this.exchange.pool.tokens.map((token, i) =>
      parseUnits(amounts[i], this.exchange.tokens[token].decimals).toString()
    );
  }

  private txData(amountsIn: BigNumberish[], bptOut: BigNumberish): string {
    if (this.exchange.pool.totalSupply.toString() === '0') {
      return this.dataEncodeFn({ kind: 'Init', amountsIn });
    } else {
      const params = { amountsIn };
      if (this.isStablePool) {
        params['bptAmountOut'] = bptOut;
      } else {
        params['minimumBPT'] = bptOut;
      }
      return this.dataEncodeFn(params);
    }
  }
}
