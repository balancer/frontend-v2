import { BigNumberish } from '@ethersproject/bignumber';
import { AddressZero } from '@ethersproject/constants';
import { parseUnits } from '@ethersproject/units';
import { Ref } from 'vue';

import {
  preMintedBptIndex,
  isComposableStable,
  isManaged,
  isStableLike,
} from '@/composables/usePool';
import { isSameAddress } from '@/lib/utils';
import { encodeJoinStablePool } from '@/lib/utils/balancer/stablePoolEncoding';
import { encodeJoinWeightedPool } from '@/lib/utils/balancer/weightedPoolEncoding';
import ConfigService from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';

import PoolExchange from '../exchange.service';
import { encodeJoinComposableStablePool } from '@/lib/utils/balancer/composableStablePoolEncoding';

export default class JoinParams {
  private pool: Ref<Pool>;
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
      this.isManagedPool && !!this.pool.value?.onchain?.swapEnabled;
    this.dataEncodeFn = this.isStableLikePool
      ? isComposableStable(exchange.pool.value.poolType)
        ? encodeJoinComposableStablePool
        : encodeJoinStablePool
      : encodeJoinWeightedPool;
  }

  public serialize(
    account: string,
    amountsIn: string[],
    tokensIn: string[],
    bptOut: string
  ): any[] {
    const parsedAmountsIn = this.parseAmounts(amountsIn, tokensIn);
    const parsedBptOut = parseUnits(
      bptOut,
      this.pool.value?.onchain?.decimals || 18
    );

    const txData = this.txData(parsedAmountsIn, parsedBptOut);
    const assets = this.parseTokensIn(tokensIn);

    const poolTokenItselfIndex = preMintedBptIndex(this.pool.value);
    const maxAmountsIn = [...parsedAmountsIn];

    if (
      isComposableStable(this.pool.value.poolType) &&
      poolTokenItselfIndex !== undefined
    ) {
      maxAmountsIn.splice(
        poolTokenItselfIndex,
        0,
        parseUnits('0', this.pool.value.onchain?.decimals || 18)
      );
    }

    return [
      this.pool.value.id,
      account,
      account,
      {
        assets,
        maxAmountsIn,
        userData: txData,
        fromInternalBalance: this.fromInternalBalance,
      },
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

    const parsedAmounts = amounts.map((amount, i) => {
      const token = tokensIn[i];
      // In WETH pools, tokenIn can include ETH so we need to check for this
      // and return the correct decimals.
      const decimals = isSameAddress(nativeAsset.address, token)
        ? nativeAsset.decimals
        : this.pool.value?.onchain?.tokens?.[token]?.decimals || 18;

      return parseUnits(amount, decimals);
    });

    return parsedAmounts;
  }

  private parseTokensIn(tokensIn: string[]): string[] {
    const nativeAsset = this.config.network.nativeAsset;
    const poolTokenItselfIndex = preMintedBptIndex(this.pool.value);
    const tokensInProcessed = tokensIn.map(address =>
      isSameAddress(address, nativeAsset.address) ? AddressZero : address
    );

    if (
      isComposableStable(this.pool.value.poolType) &&
      poolTokenItselfIndex !== undefined
    ) {
      tokensInProcessed.splice(
        poolTokenItselfIndex,
        0,
        this.pool.value.address
      );
    }
    return tokensInProcessed;
  }

  private txData(amountsIn: BigNumberish[], minimumBPT: BigNumberish): string {
    if ((this.pool.value?.onchain?.totalSupply || '0') === '0') {
      return this.dataEncodeFn({ kind: 'Init', amountsIn });
    } else {
      // Managed Pools can only be joined proportionally if trading is halted
      // This code assumes the UI has disabled non-proportional "exact in for BPT out"
      // joins in this case
      if (this.isManagedPool && !this.isSwapEnabled) {
        return this.dataEncodeFn({
          kind: 'AllTokensInForExactBPTOut',
          bptAmountOut: minimumBPT,
        });
      } else {
        return this.dataEncodeFn({
          kind: 'ExactTokensInForBPTOut',
          amountsIn,
          minimumBPT,
        });
      }
    }
  }
}
