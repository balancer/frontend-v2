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
    this.isStablePool = exchange.pool.poolType === 'Stable';
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
      this.exchange.pool.onchain.decimals
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
        assets: this.exchange.pool.tokenAddresses,
        minAmountsOut: parsedAmountsOut,
        userData: txData,
        toInternalBalance: this.toInternalBalance
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
