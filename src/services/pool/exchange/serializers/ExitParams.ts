import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { AddressZero } from '@ethersproject/constants';
import { parseUnits } from '@ethersproject/units';
import { Ref } from 'vue';

import {
  isComposableStable,
  isDeep,
  isStableLike,
} from '@/composables/usePool';
import { isSameAddress } from '@/lib/utils';
import { encodeExitStablePool } from '@/lib/utils/balancer/stablePoolEncoding';
import { encodeExitWeightedPool } from '@/lib/utils/balancer/weightedPoolEncoding';
import ConfigService from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';

import PoolExchange from '../exchange.service';

export default class ExitParams {
  private pool: Ref<Pool>;
  private config: ConfigService;
  private isStableLike: boolean;
  private dataEncodeFn: (data: any) => string;
  private toInternalBalance = false;

  constructor(exchange: PoolExchange) {
    this.pool = exchange.pool;
    this.config = exchange.config;
    this.isStableLike = isStableLike(exchange.pool.value.poolType);
    this.dataEncodeFn = this.isStableLike
      ? encodeExitStablePool
      : encodeExitWeightedPool;
  }

  public serialize(
    account: string,
    amountsOut: string[],
    tokensOut: string[],
    bptIn: string,
    exitTokenIndex: number | null,
    exactOut: boolean
  ): any[] {
    const parsedAmountsOut = this.parseAmounts(amountsOut);
    const parsedBptIn = parseUnits(
      // bptIn
      '0', // TODO - DO NOT PUSH THIS TO MASTER, FIX bptIn for ComposableStable pools,
      this.pool.value?.onchain?.decimals || 18
    );

    const assets = this.parseTokensOut(tokensOut);
    const txData = this.txData(
      parsedAmountsOut,
      parsedBptIn,
      exitTokenIndex,
      exactOut
    );

    const processedParsedAmountsOut =
      isComposableStable(this.pool.value.poolType) && !isDeep(this.pool.value)
        ? [
            parseUnits('0', this.pool.value.onchain?.decimals || 18),
            ...parsedAmountsOut,
          ]
        : parsedAmountsOut;
    return [
      this.pool.value.id,
      account,
      account,
      {
        assets,
        minAmountsOut: processedParsedAmountsOut.map(amount =>
          // This is a hack to get around rounding issues for MetaStable pools
          // TODO: do this more elegantly
          amount.gt(0) ? amount.sub(1) : amount
        ),
        userData: txData,
        toInternalBalance: this.toInternalBalance,
      },
    ];
  }

  private parseAmounts(amounts: string[]): BigNumber[] {
    return amounts.map((amount, i) => {
      const token = this.pool.value.tokensList[i];
      return parseUnits(
        amount,
        this.pool.value?.onchain?.tokens?.[token]?.decimals || 18
      );
    });
  }

  private parseTokensOut(tokensOut: string[]): string[] {
    const nativeAsset = this.config.network.nativeAsset;

    const tokensOutProcessed = tokensOut.map(address =>
      isSameAddress(address, nativeAsset.address) ? AddressZero : address
    );

    return isComposableStable(this.pool.value.poolType) &&
      !isDeep(this.pool.value)
      ? [this.pool.value.address, ...tokensOutProcessed]
      : tokensOutProcessed;
  }

  private txData(
    amountsOut: BigNumberish[],
    bptIn: BigNumberish,
    exitTokenIndex: number | null,
    exactOut: boolean
  ): string {
    const isSingleAssetOut = exitTokenIndex !== null;

    if (isSingleAssetOut) {
      return this.dataEncodeFn({
        kind: 'ExactBPTInForOneTokenOut',
        bptAmountIn: bptIn,
        exitTokenIndex,
      });
    } else if (exactOut) {
      return this.dataEncodeFn({
        amountsOut,
        maxBPTAmountIn: bptIn,
      });
    } else {
      return this.dataEncodeFn({
        kind: 'ExactBPTInForTokensOut',
        bptAmountIn: bptIn,
      });
    }
  }
}
