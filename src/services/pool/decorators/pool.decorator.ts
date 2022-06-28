import { FiatCurrency } from '@/constants/currency';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { SubgraphGauge } from '@/services/balancer/gauges/types';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { Pool } from '@/services/pool/types';
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
    console.time('DECORATED_GETDATA');
    const [
      protocolFeePercentage,
      gaugeRewardTokenAprs,
      gaugeBALAprs
    ] = await this.getData(prices, gauges, tokens);
    // console.log('protocolFeePercentage', protocolFeePercentage);
    // console.log('gaugeRewardTokenAprs', gaugeRewardTokenAprs);
    // console.log('gaugeBALAprs', gaugeBALAprs);

    console.timeEnd('DECORATED_GETDATA');
    // console.time('PROMISES');
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
      // console.timeEnd('PROMISES');

      return poolService.pool;
    });
    // console.time('resolvedPromises');
    const resolvedPromises = await Promise.all(promises);
    // console.timeEnd('resolvedPromises');
    // console.log('decorate promises', resolvedPromises);
    return resolvedPromises;
  }

  /**
   * @summary Fetch supporting data required to calculate APRs.
   */
  private async getData(
    prices: TokenPrices,
    gauges: SubgraphGauge[],
    tokens: TokenInfoMap
  ): Promise<[number, GaugeRewardTokenAprs, GaugeBalAprs]> {
    return await Promise.all([
      this.balancerContracts.vault.protocolFeesCollector.getSwapFeePercentage(),
      this.stakingRewards.getRewardTokenAprs({
        pools: this.pools,
        prices,
        gauges,
        tokens
      }),
      this.stakingRewards.getGaugeBALAprs({
        pools: this.pools,
        prices,
        gauges
      })
    ]);
  }
}
