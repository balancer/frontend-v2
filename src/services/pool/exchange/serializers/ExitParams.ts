import PoolExchange from '..';
import { encodeExitStablePool } from '@/utils/balancer/stablePoolEncoding';
import { encodeExitWeightedPool } from '@/utils/balancer/weightedPoolEncoding';
import { parseUnits } from '@ethersproject/units';
import { BigNumberish } from '@ethersproject/bignumber';

export default class ExitParams {
  private exchange: PoolExchange;
  private isStablePool: boolean;
  private dataEncodeFn: Function;
  private toInternalBalance = false;

  constructor(exchange) {
    this.exchange = exchange;
    this.isStablePool = exchange.pool.strategy.name === 'stablePool';
    this.dataEncodeFn = this.isStablePool
      ? encodeExitStablePool
      : encodeExitWeightedPool;
  }

  public serialize(
    account: string,
    amountsOut: string[],
    bptIn: string,
    exitTokenIndex: number | null,
    exactOut: boolean
  ): any[] {
    const parsedAmountsOut = this.parseAmounts(amountsOut);
    const parsedBptIn = parseUnits(
      bptIn,
      this.exchange.tokens[this.exchange.pool.address].decimals
    ).toString();
    const txData = this.txData(
      parsedAmountsOut,
      parsedBptIn,
      exitTokenIndex,
      exactOut
    );

    return [
      this.exchange.pool.id,
      account,
      account,
      {
        assets: this.exchange.pool.tokens,
        minAmountsOut: parsedAmountsOut,
        userData: txData,
        toInternalBalance: this.toInternalBalance
      }
    ];
  }

  private parseAmounts(amounts: string[]): BigNumberish[] {
    return this.exchange.pool.tokens.map((token, i) =>
      parseUnits(amounts[i], this.exchange.tokens[token].decimals).toString()
    );
  }

  private txData(
    amountsOut: BigNumberish[],
    bptIn: BigNumberish,
    exitTokenIndex: number | null,
    exactOut: boolean
  ): string {
    const isSingleAssetOut = exitTokenIndex !== null;

    if (this.isStablePool) {
      return this.dataEncodeFn({
        kind: 'ExactBPTInForAllTokensOut',
        bptAmountIn: bptIn
      });
    } else {
      if (isSingleAssetOut) {
        return this.dataEncodeFn({
          kind: 'ExactBPTInForOneTokenOut',
          bptAmountIn: bptIn,
          exitTokenIndex
        });
      } else if (exactOut) {
        return this.dataEncodeFn({
          kind: 'BPTInForExactTokensOut',
          amountsOut,
          maxBPTAmountIn: bptIn
        });
      } else {
        return this.dataEncodeFn({
          kind: 'ExactBPTInForAllTokensOut',
          bptAmountIn: bptIn
        });
      }
    }
  }
}
