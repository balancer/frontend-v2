import { differenceInWeeks } from 'date-fns';
import { getAddress } from 'ethers/lib/utils';

import { isStable } from '@/composables/usePool';
import { oneSecondInMs } from '@/composables/useTime';
import { FiatCurrency } from '@/constants/currency';
import { bnum } from '@/lib/utils';

import { balancerSubgraphService } from '../balancer/subgraph/balancer-subgraph.service';
import {
  LinearPool,
  Pool,
  PoolAPRs,
  PoolToken
} from '../balancer/subgraph/types';
import { TokenPrices } from '../coingecko/api/price.service';
import { GaugeBalApr } from '../staking/staking-rewards.service';
import { AprConcern } from './concerns/apr.concern';
import LiquidityConcern from './concerns/liquidity.concern';

export default class PoolService {
  constructor(
    public pool: Pool,
    public liquidity = LiquidityConcern,
    public apr = AprConcern
  ) {
    this.format();
  }

  /**
   * @summary Statically format various pool attributes.
   */
  public format(): Pool {
    this.pool.address = this.address;
    this.pool.isNew = this.isNew;
    this.pool.tokenAddresses = this.pool.tokensList.map(t => getAddress(t));
    this.formatPoolTokens();
    return this.pool;
  }

  public get address(): string {
    return getAddress(this.pool.id.slice(0, 42));
  }

  public get bptPrice(): string {
    return bnum(this.pool.totalLiquidity)
      .div(this.pool.totalShares)
      .toString();
  }

  /**
   * @summary Calculates and sets total liquidity of pool.
   */
  public setTotalLiquidity(
    prices: TokenPrices,
    currency: FiatCurrency
  ): string {
    const liquidityConcern = new this.liquidity(this.pool);
    const totalLiquidity = liquidityConcern.calcTotal(prices, currency);
    return (this.pool.totalLiquidity = totalLiquidity);
  }

  /**
   * @summary Calculates APRs for pool.
   */
  public async setAPR(
    poolSnapshot: Pool | undefined,
    prices: TokenPrices,
    currency: FiatCurrency,
    protocolFeePercentage: number,
    stakingBalApr: GaugeBalApr,
    stakingRewardApr = '0'
  ): Promise<PoolAPRs> {
    const aprConcern = new this.apr(this.pool);
    const apr = await aprConcern.calc(
      poolSnapshot,
      prices,
      currency,
      protocolFeePercentage,
      stakingBalApr,
      stakingRewardApr
    );

    return (this.pool.apr = apr);
  }

  /**
   * fetches StablePhantom linear pools and extracts
   * required attributes.
   */
  public async getLinearPoolAttrs(): Promise<Record<string, PoolToken>> {
    // Fetch linear pools from subgraph
    const linearPools = (await balancerSubgraphService.pools.get(
      {
        where: {
          address_in: this.pool.tokensList,
          totalShares_gt: -1 // Avoid the filtering for low liquidity pools
        }
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

      this.pool.mainTokens[index] = getAddress(
        linearPool.tokensList[linearPool.mainIndex]
      );
      this.pool.wrappedTokens[index] = getAddress(
        linearPool.tokensList[linearPool.wrappedIndex]
      );

      linearPool.tokens
        .filter(token => token.address !== linearPool.address)
        .forEach(token => {
          const address = getAddress(token.address);

          linearPoolTokensMap[address] = {
            ...token,
            address
          };
        });
    });

    return (this.pool.linearPoolTokensMap = linearPoolTokensMap);
  }

  removePreMintedBPT(): string[] {
    const poolAddress = balancerSubgraphService.pools.addressFor(this.pool.id);
    // Remove pre-minted BPT token if exits
    return (this.pool.tokensList = this.pool.tokensList.filter(
      address => address !== poolAddress.toLowerCase()
    ));
  }

  formatPoolTokens(): PoolToken[] {
    const tokens = this.pool.tokens.map(token => ({
      ...token,
      address: getAddress(token.address)
    }));

    if (isStable(this.pool.poolType)) return (this.pool.tokens = tokens);

    return (this.pool.tokens = tokens.sort(
      (a, b) => parseFloat(b.weight) - parseFloat(a.weight)
    ));
  }

  public setFeesSnapshot(poolSnapshot: Pool | undefined): string {
    if (!poolSnapshot) return '0';

    const feesSnapshot = bnum(this.pool.totalSwapFee)
      .minus(poolSnapshot.totalSwapFee)
      .toString();

    return (this.pool.feesSnapshot = feesSnapshot);
  }

  public setVolumeSnapshot(poolSnapshot: Pool | undefined): string {
    if (!poolSnapshot) return '0';

    const volumeSnapshot = bnum(this.pool.totalSwapVolume)
      .minus(poolSnapshot.totalSwapVolume)
      .toString();

    return (this.pool.volumeSnapshot = volumeSnapshot);
  }

  public get isNew(): boolean {
    return (
      differenceInWeeks(Date.now(), this.pool.createTime * oneSecondInMs) < 1
    );
  }
}
