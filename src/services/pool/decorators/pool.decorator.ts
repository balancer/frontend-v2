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
    const processedPools = this.pools.map(pool => {
      const poolService = new this.poolServiceClass(pool);
      poolService.removePreMintedBPT();
      poolService.setTotalLiquidity(prices, currency, tokens);
      poolService.setUnwrappedTokens();

      return poolService.pool;
    });

    const [
      protocolFeePercentage,
      gaugeBALAprs,
      gaugeRewardTokenAprs,
      poolSnapshots,
      rawOnchainDataMap
    ] = await this.getData(prices, gauges, tokens, processedPools);

    const promises = processedPools.map(async pool => {
      const poolSnapshot = poolSnapshots.find(p => p.id === pool.id);
      const poolService = new this.poolServiceClass(pool);

      poolService.setOnchainData(rawOnchainDataMap[pool.id], tokens);
      poolService.setFeesSnapshot(poolSnapshot);
      poolService.setVolumeSnapshot(poolSnapshot);

      await Promise.all([
        poolService.setLinearPools(),
        poolService.setAPR(
          poolSnapshot,
          prices,
          currency,
          protocolFeePercentage,
          gaugeBALAprs[pool.id],
          gaugeRewardTokenAprs[pool.id]
        )
      ]);
      return poolService.pool;
    });

    return await Promise.all(promises);
  }

  public async decorateSinglePool(
    prices: TokenPrices,
    currency: FiatCurrency,
    tokens: TokenInfoMap
  ): Promise<Pool> {
    const poolMulticaller = new PoolMulticaller(this.pools);
    const [poolSnapshots, rawOnchainDataMap] = await Promise.all([
      this.getSnapshots(),
      poolMulticaller.fetch()
    ]);
    const pool = this.pools[0];
    const poolSnapshot = poolSnapshots.find(p => p.id === pool.id);
    const poolService = new this.poolServiceClass(pool);

    poolService.removePreMintedBPT();
    await poolService.setLinearPools();
    poolService.setOnchainData(rawOnchainDataMap[pool.id], tokens);
    poolService.setTotalLiquidity(prices, currency, tokens);
    poolService.setFeesSnapshot(poolSnapshot);
    poolService.setVolumeSnapshot(poolSnapshot);
    poolService.setUnwrappedTokens();

    return poolService.pool;
  }

  /**
   * @summary Get snapshot data of pools
   * @description Getting the past state of pools allows us to calculate
   * snapshot values like volume and fees, currently fixed at past 24h
   * (see getTimeTravelBlock).
   */
  private async getSnapshots(): Promise<Pool[]> {
    const currentBlock = await this.providerService.getBlockNumber();
    const blockNumber = getTimeTravelBlock(currentBlock);
    const block = { number: blockNumber };
    const isInPoolIds = { id_in: this.pools.map(pool => pool.id) };
    try {
      const data = await this.poolSubgraph.pools.get({
        where: isInPoolIds,
        block
      });
      return data;
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
    pools: Pool[]
  ): Promise<
    [number, GaugeBalAprs, GaugeRewardTokenAprs, Pool[], RawOnchainPoolDataMap]
  > {
    const poolMulticaller = new PoolMulticaller(pools);

    return await Promise.all([
      this.balancerContracts.vault.protocolFeesCollector.getSwapFeePercentage(),
      this.stakingRewards.getGaugeBALAprs({
        pools,
        prices,
        gauges
      }),
      this.stakingRewards.getRewardTokenAprs({
        pools,
        prices,
        gauges,
        tokens
      }),
      this.getSnapshots(),
      poolMulticaller.fetch()
    ]);
  }
}
