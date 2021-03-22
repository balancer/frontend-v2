import PoolService from '../Exchange';
import { encodeExitStablePool } from '@/utils/balancer/stablePoolEncoding';
import { encodeExitWeightedPool } from '@/utils/balancer/weightedPoolEncoding';
import { parseUnits } from '@ethersproject/units';
import { BigNumberish } from '@ethersproject/bignumber';

export default class ExitParams {
  private service: PoolService;
  private isStablePool: boolean;
  private dataEncodeFn: Function;
  private toInternalBalance = false;

  constructor(service) {
    this.service = service;
    this.isStablePool = service.pool.strategy.name === 'stablePool';
    this.dataEncodeFn = this.isStablePool
      ? encodeExitStablePool
      : encodeExitWeightedPool;
  }

  public serialize(
    account: string,
    amountsOut: string[],
    bptIn: string,
    exitTokenIndex: number | null
  ): any[] {
    const parsedAmountsOut = this.parseAmounts(amountsOut);
    const parsedBptIn = parseUnits(
      bptIn,
      this.service.tokens[this.service.pool.address].decimals
    );
    const txData = this.txData(parsedAmountsOut, parsedBptIn, exitTokenIndex);

    return [
      this.service.pool.id,
      account,
      this.service.pool.tokens,
      parsedAmountsOut,
      this.toInternalBalance,
      txData
    ];
  }

  private parseAmounts(amounts: string[]): BigNumberish[] {
    return this.service.pool.tokens.map((token, i) =>
      parseUnits(amounts[i], this.service.tokens[token].decimals).toString()
    );
  }

  private txData(
    amountsOut: BigNumberish[],
    bptIn: BigNumberish,
    exitTokenIndex: number | null
  ): string {
    const isSingleAssetOut = exitTokenIndex !== null;
    console.log('params2', amountsOut, bptIn, exitTokenIndex, isSingleAssetOut)
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
      } else {
        return this.dataEncodeFn({
          kind: 'BPTInForExactTokensOut',
          amountsOut,
          maxBPTAmountIn: bptIn
        });
      }
    }
  }
}
