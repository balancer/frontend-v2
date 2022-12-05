import { differenceInWeeks } from 'date-fns';

import { isStable, isDeep } from '@/composables/usePool';
import { oneSecondInMs } from '@/composables/useTime';
import { bnum, isSameAddress } from '@/lib/utils';
import {
  LinearPool,
  OnchainPoolData,
  Pool,
  PoolToken,
  RawOnchainPoolData,
} from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';

import { balancerSubgraphService } from '../balancer/subgraph/balancer-subgraph.service';
import LiquidityConcern from './concerns/liquidity.concern';
import { OnchainDataFormater } from './decorators/onchain-data.formater';
import { AprBreakdown } from '@balancer-labs/sdk';
import { networkId } from '@/composables/useNetwork';
import { balancer } from '@/lib/balancer.sdk';
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
      const sdkTotalLiquidity = await balancer.pools.liquidity(
        this.pool as unknown as SDKPool
      );
      // if totalLiquidity can be computed from coingecko prices, use that
      // else, use the value retrieved from the subgraph
      if (bnum(totalLiquidity).gt(0)) {
        totalLiquidity = sdkTotalLiquidity;
      }
    } catch (error) {
      captureException(error);
      console.error(`Failed to calc liqudity for: ${this.pool.id}`, error);
    }

    return (this.pool.totalLiquidity = totalLiquidity);
  }

  /**
   * @summary Calculates APRs for pool.
   */
  public async setAPR(): Promise<AprBreakdown> {
    let apr = this.pool.apr;

    try {
      const sdkApr = await balancer.pools.apr(this.pool);
      if (sdkApr) apr = sdkApr;
    } catch (error) {
      captureException(error);
      console.error(`Failed to calc APR for: ${this.pool.id}`, error);
    }

    return (this.pool.apr = apr as AprBreakdown);
  }

  /**
   * fetches StablePhantom linear pools and extracts
   * required attributes.
   */
  public async setLinearPools(): Promise<Record<string, PoolToken> | null> {
    if (!isDeep(this.pool)) return null;

    // Fetch linear pools from subgraph
    const linearPools = (await balancerSubgraphService.pools.get(
      {
        where: {
          address_in: this.pool.tokensList,
          totalShares_gt: -1, // Avoid the filtering for low liquidity pools
        },
      },
      { mainIndex: true, wrappedIndex: true }
    )) as LinearPool[];

    const linearPoolTokensMap: Pool['linearPoolTokensMap'] = {};

    // Inject main/wrapped tokens into pool schema
    linearPools.forEach(linearPool => {
      if (!this.pool.mainTokens) this.pool.mainTokens = [];
      if (!this.pool.wrappedTokens) this.pool.wrappedTokens = [];

      const index = this.pool.tokensList.indexOf(
        linearPool.address.toLowerCase()
      );

      this.pool.mainTokens[index] = linearPool.tokensList[linearPool.mainIndex];
      this.pool.wrappedTokens[index] =
        linearPool.tokensList[linearPool.wrappedIndex];

      linearPool.tokens
        .filter(token => !isSameAddress(token.address, linearPool.address))
        .forEach(token => {
          linearPoolTokensMap[token.address] = token;
        });
    });

    return (this.pool.linearPoolTokensMap = linearPoolTokensMap);
  }

  removeBptFromTokens(): string[] {
    return (this.pool.tokensList = this.pool.tokensList.filter(
      address => !isSameAddress(address, this.pool.address)
    ));
  }

  formatPoolTokens(): PoolToken[] {
    if (isStable(this.pool.poolType)) return this.pool.tokens;

    return (this.pool.tokens = this.pool.tokens.sort(
      (a, b) => parseFloat(b.weight) - parseFloat(a.weight)
    ));
  }

  public setFeesSnapshot(poolSnapshot: Pool | undefined): string {
    let snapshotFees = '0';
    if (poolSnapshot) snapshotFees = poolSnapshot.totalSwapFee;

    const feesSnapshot = bnum(this.pool.totalSwapFee)
      .minus(snapshotFees)
      .toString();

    return (this.pool.feesSnapshot = feesSnapshot);
  }

  public setVolumeSnapshot(poolSnapshot: Pool | undefined): string {
    let snapshotVolume = '0';
    if (poolSnapshot) snapshotVolume = poolSnapshot.totalSwapVolume;

    const volumeSnapshot = bnum(this.pool.totalSwapVolume)
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
    return (
      differenceInWeeks(Date.now(), this.pool.createTime * oneSecondInMs) < 1
    );
  }
}
