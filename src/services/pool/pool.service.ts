import { differenceInWeeks } from 'date-fns';

import { isStable } from '@/composables/usePool';
import { oneSecondInMs } from '@/composables/useTime';
import { bnum } from '@/lib/utils';
import {
  OnchainPoolData,
  Pool,
  PoolToken,
  RawOnchainPoolData,
} from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';

import LiquidityConcern from './concerns/liquidity.concern';
import { OnchainDataFormater } from './decorators/onchain-data.formater';
import { AprBreakdown } from '@balancer-labs/sdk';
import { networkId } from '@/composables/useNetwork';
import { getBalancer } from '@/dependencies/balancer-sdk';
import { Pool as SDKPool } from '@balancer-labs/sdk';
import { captureException } from '@sentry/browser';

export default class PoolService {
  constructor(public pool: Pool, public liquidity = LiquidityConcern) {
    this.format();
  }

  /**
   * @summary Statically format various pool attributes.
   */
  public format(): Pool {
    this.pool.isNew = this.isNew;
    this.pool.chainId = networkId.value;
    this.formatPoolTokens();
    return this.pool;
  }

  public get bptPrice(): string {
    return bnum(this.pool.totalLiquidity).div(this.pool.totalShares).toString();
  }

  /**
   * @summary Calculates and sets total liquidity of pool.
   */
  public async setTotalLiquidity(): Promise<string> {
    let totalLiquidity = this.pool.totalLiquidity;

    try {
      const sdkTotalLiquidity = await getBalancer().pools.liquidity(
        this.pool as unknown as SDKPool
      );
      // if totalLiquidity can be computed from coingecko prices, use that
      // else, use the value retrieved from the subgraph
      if (bnum(totalLiquidity).gt(0)) {
        totalLiquidity = sdkTotalLiquidity;
      }
    } catch (error) {
      captureException(error);
      console.error(`Failed to calc liquidity for: ${this.pool.id}`, error);
    }

    return (this.pool.totalLiquidity = totalLiquidity);
  }

  /**
   * @summary Calculates APRs for pool.
   */
  public async setAPR(): Promise<AprBreakdown> {
    let apr = this.pool.apr;

    try {
      const sdkApr = await getBalancer().pools.apr(this.pool);
      if (sdkApr) apr = sdkApr;
    } catch (error) {
      captureException(error);
      console.error(`Failed to calc APR for: ${this.pool.id}`, error);
    }

    return (this.pool.apr = apr as AprBreakdown);
  }

  formatPoolTokens(): PoolToken[] {
    if (isStable(this.pool.poolType)) return this.pool.tokens;

    return (this.pool.tokens = this.pool.tokens.sort(
      (a, b) => parseFloat(b.weight || '0') - parseFloat(a.weight || '0')
    ));
  }

  public setFeesSnapshot(poolSnapshot: Pool | undefined): string {
    let snapshotFees = '0';
    if (poolSnapshot) snapshotFees = poolSnapshot.totalSwapFee || '0';

    const feesSnapshot = bnum(this.pool.totalSwapFee || 0)
      .minus(snapshotFees)
      .toString();

    return (this.pool.feesSnapshot = feesSnapshot);
  }

  public setVolumeSnapshot(poolSnapshot: Pool | undefined): string {
    let snapshotVolume = '0';
    if (poolSnapshot) snapshotVolume = poolSnapshot.totalSwapVolume || '0';

    const volumeSnapshot = bnum(this.pool.totalSwapVolume || 0)
      .minus(snapshotVolume)
      .toString();

    return (this.pool.volumeSnapshot = volumeSnapshot);
  }

  public setOnchainData(
    rawOnchainData: RawOnchainPoolData,
    tokenMeta: TokenInfoMap
  ): OnchainPoolData | undefined {
    try {
      const onchainData = new OnchainDataFormater(
        this.pool,
        rawOnchainData,
        tokenMeta
      );
      return (this.pool.onchain = onchainData.format());
    } catch (e) {
      console.warn(e);
    }
  }

  public setUnwrappedTokens(): string[] {
    const unwrappedTokens = Object.entries(
      this.pool?.onchain?.linearPools || {}
    ).map(([, linearPool]) => linearPool.unwrappedTokenAddress);
    return (this.pool.unwrappedTokens = unwrappedTokens);
  }

  public get isNew(): boolean {
    if (!this.pool.createTime) return false;

    return (
      differenceInWeeks(Date.now(), this.pool.createTime * oneSecondInMs) < 1
    );
  }
}
