import { getAddress } from '@ethersproject/address';
import { differenceInWeeks } from 'date-fns';

import { isStable } from '@/composables/usePool';
import { oneSecondInMs } from '@/composables/useTime';
import { FiatCurrency } from '@/constants/currency';
import { bnum } from '@/lib/utils';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { SubgraphGauge } from '@/services/balancer/gauges/types';
import {
  AnyPool,
  DecoratedPool,
  Pool,
  PoolToken
} from '@/services/balancer/subgraph/types';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import {
  GaugeBalAprs,
  GaugeRewardTokenAprs,
  stakingRewardsService
} from '@/services/staking/staking-rewards.service';
import { TokenInfoMap } from '@/types/TokenList';

import PoolService from '../pool.service';

/**
 * @summary Decorates a set of pools with additonal data.
 */
export class PoolDecorator {
  constructor(
    public pools: Pool[],
    private readonly balancerContracts = balancerContractsService,
    private readonly stakingRewards = stakingRewardsService,
    private readonly poolServiceClass = PoolService
  ) {}

  public async decorate(
    gauges: SubgraphGauge[],
    prices: TokenPrices,
    currency: FiatCurrency,
    poolSnapshots: Pool[],
    tokens: TokenInfoMap
  ): Promise<DecoratedPool[]> {
    const [
      protocolFeePercentage,
      gaugeBALAprs,
      gaugeRewardTokenAprs
    ] = await this.getData(prices, gauges, tokens);

    const promises = this.pools.map(async pool => {
      const poolService = new this.poolServiceClass(pool);
      const poolSnapshot = poolSnapshots.find(p => p.id === pool.id);

      pool = this.staticDecoration(pool);

      pool.totalLiquidity = poolService.calcTotalLiquidity(prices, currency);

      const volume = this.calcVolume(pool, poolSnapshot);
      const fees = this.calcFees(pool, poolSnapshot);
      const isNewPool = this.isNewPool(pool);

      const apr = await poolService.apr.calc(
        poolSnapshot,
        prices,
        currency,
        protocolFeePercentage,
        gaugeBALAprs[pool.id],
        gaugeRewardTokenAprs[pool.id]
      );

      return {
        ...pool,
        dynamic: {
          apr,
          volume,
          fees,
          isNewPool
        }
      };
    });

    return await Promise.all(promises);
  }

  /**
   * @summary Decorate pool with static data
   */
  private staticDecoration(pool: AnyPool): AnyPool {
    pool.address = this.addressFor(pool.id);
    pool.tokenAddresses = pool.tokensList.map(t => getAddress(t));
    pool.tokens = this.formatPoolTokens(pool);

    return {
      ...pool,
      address: this.addressFor(pool.id),
      tokenAddresses: pool.tokensList.map(t => getAddress(t)),
      tokens: this.formatPoolTokens(pool)
    };
  }

  /**
   * @summary Fetch supporting data required to calculate APRs.
   */
  private async getData(
    prices: TokenPrices,
    gauges: SubgraphGauge[],
    tokens: TokenInfoMap
  ): Promise<[number, GaugeBalAprs, GaugeRewardTokenAprs]> {
    return await Promise.all([
      this.balancerContracts.vault.protocolFeesCollector.getSwapFeePercentage(),
      await this.stakingRewards.getGaugeBALAprs({
        pools: this.pools,
        prices,
        gauges
      }),
      await this.stakingRewards.getRewardTokenAprs({
        pools: this.pools,
        prices,
        gauges,
        tokens
      })
    ]);
  }

  private formatPoolTokens(pool: Pool): PoolToken[] {
    const tokens = pool.tokens.map(token => ({
      ...token,
      address: getAddress(token.address)
    }));

    if (isStable(pool.poolType)) return tokens;

    return tokens.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
  }

  private calcVolume(pool: Pool, poolSnapshot: Pool | undefined): string {
    if (!poolSnapshot) return pool.totalSwapVolume;

    return bnum(pool.totalSwapVolume)
      .minus(poolSnapshot.totalSwapVolume)
      .toString();
  }

  private calcFees(pool: Pool, poolSnapshot: Pool | undefined): string {
    if (!poolSnapshot) return pool.totalSwapFee;

    return bnum(pool.totalSwapFee)
      .minus(poolSnapshot.totalSwapFee)
      .toString();
  }

  private isNewPool(pool: Pool): boolean {
    return differenceInWeeks(Date.now(), pool.createTime * oneSecondInMs) < 1;
  }

  private addressFor(poolId: string): string {
    return getAddress(poolId.slice(0, 42));
  }
}
