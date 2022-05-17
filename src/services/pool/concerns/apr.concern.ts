import { SubgraphGauge } from '@/services/balancer/gauges/types';
import { AnyPool, Pool, PoolAPRs } from '@/services/balancer/subgraph/types';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import {
  GaugeBalApr,
  GaugeRewardTokenAprs,
  stakingRewardsService
} from '@/services/staking/staking-rewards.service';
import { TokenInfoMap } from '@/types/TokenList';

export class AprConcern {
  constructor(
    public readonly pool: AnyPool,
    private readonly stakingRewards = stakingRewardsService
  ) {}

  public calc(gaugeBalApr: GaugeBalApr, gaugeRewardApr: string): PoolAPRs {
    return {
      total: '0',
      swap: swapFeeAPR,
      yield: yieldAPR,
      staking: {
        bal: gaugeBalApr,
        rewards: gaugeRewardApr
      }
    };
  }

  public async fetchGaugeAprs(
    pools: Pool[],
    gauges: SubgraphGauge[],
    prices: TokenPrices,
    tokens: TokenInfoMap
  ) {
    const [gaugeBALAprs, gaugeRewardTokenAprs] = await Promise.all([
      await this.stakingRewards.getGaugeBALAprs({
        prices,
        gauges,
        pools
      }),
      await this.stakingRewards.getRewardTokenAprs({
        prices,
        gauges,
        pools,
        tokens
      })
    ]);

    return {
      gaugeBALAprs,
      gaugeRewardTokenAprs
    };
  }
}
