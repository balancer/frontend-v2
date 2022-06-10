import { getTimeTravelBlock } from '@/composables/useSnapshots';
import { FiatCurrency } from '@/constants/currency';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { SubgraphGauge } from '@/services/balancer/gauges/types';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { Pool, RawOnchainPoolDataMap } from '@/services/pool/types';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import {
  GaugeBalAprs,
  GaugeRewardTokenAprs,
  stakingRewardsService
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
    tokens: TokenInfoMap
  ): Promise<Pool[]> {
    const [
      protocolFeePercentage,
      gaugeBALAprs,
      gaugeRewardTokenAprs,
      poolSnapshots,
      rawOnchainDataMap
    ] = await this.getData(prices, gauges, tokens);

    const promises = this.pools.map(async pool => {
      const poolSnapshot = poolSnapshots.find(p => p.id === pool.id);
      const poolService = new this.poolServiceClass(pool);

      poolService.removePreMintedBPT();
      await poolService.setLinearPools();
      poolService.setOnchainData(rawOnchainDataMap[pool.id], tokens);
      poolService.setTotalLiquidity(prices, currency, tokens);
      poolService.setFeesSnapshot(poolSnapshot);
      poolService.setVolumeSnapshot(poolSnapshot);
      poolService.setUnwrappedTokens();

      console.log(pool);

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
   * @summary Get snapshot data of pools
   * @description Getting the past state of pools allows us to calculate
   * snapshot values like volume and fees, currently fixed at past 24h
   * (see getTimeTravelBlock).
   */
  private async getSnapshots(): Promise<Pool[]> {
    const currentBlock = await this.providerService.getBlockNumber();
    const blockNumber = await getTimeTravelBlock(currentBlock);
    const block = { number: blockNumber };
    const isInPoolIds = { id_in: this.pools.map(pool => pool.id) };
    try {
      return await this.poolSubgraph.pools.get({
        where: isInPoolIds,
        block
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
    tokens: TokenInfoMap
  ): Promise<
    [number, GaugeBalAprs, GaugeRewardTokenAprs, Pool[], RawOnchainPoolDataMap]
  > {
    const poolMulticaller = new PoolMulticaller(this.pools);

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
      }),
      await this.getSnapshots(),
      await poolMulticaller.fetch()
    ]);
  }
}
