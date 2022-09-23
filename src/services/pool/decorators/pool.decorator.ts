import { getTimeTravelBlock } from '@/composables/useSnapshots';
import { FiatCurrency } from '@/constants/currency';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { SubgraphGauge } from '@/services/balancer/gauges/types';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { Pool } from '@/services/pool/types';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import {
  GaugeBalAprs,
  GaugeRewardTokenAprs,
  stakingRewardsService,
} from '@/services/staking/staking-rewards.service';
import { TokenInfoMap } from '@/types/TokenList';

import PoolService from '../pool.service';
import { PoolMulticaller } from './pool.multicaller';

/**
 * @summary Decorates a set of pools with additonal data.
 */
export class PoolDecorator {
  constructor(
    public pools: Pool[],
    private readonly balancerContracts = balancerContractsService,
    private readonly stakingRewards = stakingRewardsService,
    private readonly poolServiceClass = PoolService,
    private readonly providerService = rpcProviderService,
    private readonly poolSubgraph = balancerSubgraphService
  ) {}

  public async decorate(
    gauges: SubgraphGauge[],
    prices: TokenPrices,
    currency: FiatCurrency,
    tokens: TokenInfoMap,
    includeAprs = true
  ): Promise<Pool[]> {
    const processedPools = this.pools.map(pool => {
      const poolService = new this.poolServiceClass(pool);
      poolService.removePreMintedBPT();
      poolService.setTotalLiquidity(prices, currency, tokens);
      poolService.setUnwrappedTokens();
      return poolService.pool;
    });

    const poolMulticaller = new PoolMulticaller(processedPools);

    const [
      poolSnapshots,
      rawOnchainDataMap,
      [protocolFeePercentage, gaugeBALAprs, gaugeRewardTokenAprs],
    ] = await Promise.all([
      this.getSnapshots(),
      poolMulticaller.fetch(),
      this.getData(prices, gauges, tokens, processedPools, includeAprs),
    ]);

    const setAprCondition =
      gaugeBALAprs &&
      gaugeRewardTokenAprs &&
      typeof protocolFeePercentage === 'number';

    const promises = processedPools.map(async pool => {
      const poolSnapshot = poolSnapshots.find(p => p.id === pool.id);
      const poolService = new this.poolServiceClass(pool);

      poolService.setOnchainData(rawOnchainDataMap[pool.id], tokens);
      poolService.setFeesSnapshot(poolSnapshot);
      poolService.setVolumeSnapshot(poolSnapshot);
      await poolService.setLinearPools();

      if (setAprCondition) {
        await poolService.setAPR(
          poolSnapshot,
          prices,
          currency,
          protocolFeePercentage,
          gaugeBALAprs[pool.id],
          gaugeRewardTokenAprs[pool.id]
        );
      }

      return poolService.pool;
    });

    return await Promise.all(promises);
  }

  /**
   * Re-sets totalLiquidty on all pools, typically after prices have been updated.
   */
  public reCalculateTotalLiquidities(
    prices: TokenPrices,
    currency: FiatCurrency,
    tokens: TokenInfoMap
  ): Pool[] {
    return this.pools.map(pool => {
      const poolService = new this.poolServiceClass(pool);
      poolService.setTotalLiquidity(prices, currency, tokens);
      return poolService.pool;
    });
  }

  /**
   * @summary Get snapshot data of pools
   * @description Getting the past state of pools allows us to calculate
   * snapshot values like volume and fees, currently fixed at past 24h
   * (see getTimeTravelBlock).
   */
  private async getSnapshots(): Promise<Pool[]> {
    const blockNumber = await getTimeTravelBlock();
    const block = { number: blockNumber };
    const isInPoolIds = { id_in: this.pools.map(pool => pool.id) };
    try {
      return await this.poolSubgraph.pools.get({
        where: isInPoolIds,
        block,
      });
    } catch (error) {
      console.error('Failed to fetch pool snapshots', error);
      return [];
    }
  }

  /**
   * @summary Fetch supporting data required to calculate APRs.
   */
  public async getData(
    prices: TokenPrices,
    gauges: SubgraphGauge[],
    tokens: TokenInfoMap,
    pools: Pool[],
    includeAprs = true
  ): Promise<
    [number, GaugeBalAprs, GaugeRewardTokenAprs] | [null, null, null]
  > {
    if (!includeAprs) {
      return [null, null, null];
    }
    return await Promise.all([
      this.balancerContracts.vault.protocolFeesCollector.getSwapFeePercentage(),
      this.stakingRewards.getGaugeBALAprs({
        pools,
        prices,
        gauges,
      }),
      this.stakingRewards.getRewardTokenAprs({
        pools,
        prices,
        gauges,
        tokens,
      }),
    ]);
  }
}
