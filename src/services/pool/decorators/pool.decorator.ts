import { FiatCurrency } from '@/constants/currency';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { SubgraphGauge } from '@/services/balancer/gauges/types';
import { Pool } from '@/services/balancer/subgraph/types';
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
  ): Promise<Pool[]> {
    const [
      protocolFeePercentage,
      gaugeBALAprs,
      gaugeRewardTokenAprs
    ] = await this.getData(prices, gauges, tokens);

    const promises = this.pools.map(async pool => {
      const poolSnapshot = poolSnapshots.find(p => p.id === pool.id);
      const poolService = new this.poolServiceClass(pool);

      poolService.setTotalLiquidity(prices, currency);
      poolService.setFeesSnapshot(poolSnapshot);
      poolService.setVolumeSnapshot(poolSnapshot);

      await poolService.setAPR(
        poolSnapshot,
        prices,
        currency,
        protocolFeePercentage,
        gaugeBALAprs[pool.id],
        gaugeRewardTokenAprs[pool.id]
      );

      return poolService.pool;
    });

    return await Promise.all(promises);
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
}
