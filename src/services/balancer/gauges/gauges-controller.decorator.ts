import LiquidityGaugeAbi from '@/lib/abi/LiquidityGaugeV5.json';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { AddressZero } from '@ethersproject/constants';
import {
  Pool,
  PoolWithGauge
} from '@/services/balancer/subgraph/types';

const MAX_REWARD_TOKENS = 8;

export class GaugesControllerDecorator {
  multicaller: Multicaller;

  constructor(
    private readonly abi = LiquidityGaugeAbi,
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly config = configService
  ) {
    this.multicaller = this.resetMulticaller();
  }

  /**
   * @summary Decorate subgraph gauge schema with onchain data using multicalls.
   */
  async decorate(
    pools: PoolWithGauge[],
    userAddress: string
  ): Promise<PoolWithGauge[]> {
    this.resetMulticaller();
    this.callGaugeVotes(pools);
    this.callUserGaugeVotes(pools, userAddress);

    let gaugesDataMap = await this.multicaller.execute<OnchainGaugeDataMap>();

    this.callClaimableRewards(subgraphGauges, userAddress, gaugesDataMap);

    gaugesDataMap = await this.multicaller.execute<OnchainGaugeDataMap>(
      gaugesDataMap
    );

    return subgraphGauges.map(subgraphGauge => ({
      ...subgraphGauge,
      ...this.format(gaugesDataMap[subgraphGauge.id])
    }));
  }

  /**
   * @summary Fetch list of reward token addresses for gauge.
   */
  private callGaugeVotes(pools: PoolWithGauge[]) {
    pools.forEach(pool => {
      for (let i = 0; i < MAX_REWARD_TOKENS; i++) {
        this.multicaller.call(
          `${pool.id}.gauge.votes`,
          pool.gauge.address,
          'gauge_relative_weight',
          [pool.gauge.address]
        );
      }
    });
  }

  /**
   * @summary Fetch user's claimable BAL for each gauge.
   */
  private callUserGaugeVotes(
    pools: PoolWithGauge[],
    userAddress: string
  ) {
    pools.forEach(pool => {
      this.multicaller.call(
        `${pool.id}.gauge.userVotes`,
        pool.id,
        'vote_user_slopes',
        [userAddress, pool.gauge.address]
      );
    });
  }

  private resetMulticaller(): Multicaller {
    return new Multicaller(this.config.network.key, this.provider, this.abi);
  }
}

export const gaugesControllerDecorator = new GaugesControllerDecorator();