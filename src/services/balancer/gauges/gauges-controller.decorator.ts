import GaugeControllerAbi from '@/lib/abi/GaugeController.json';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { GaugeInformation, PoolWithGauge } from '@/services/balancer/subgraph/types';

const MAX_REWARD_TOKENS = 8;

interface GaugeInfo {
  userVotes: any;
  votes: any;
}

interface GaugesDataMap {
  gauge: GaugeInfo;
}

export class GaugesControllerDecorator {
  multicaller: Multicaller;

  constructor(
    private readonly abi = GaugeControllerAbi,
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
    this.multicaller = this.resetMulticaller();
    this.callGaugeVotes(pools);
    this.callUserGaugeVotes(pools, userAddress);

    const gaugesDataMap = await this.multicaller.execute();

    return pools.map(pool => {
      const gauge = this.format(
        pool.gauge.address,
        gaugesDataMap[pool.id].gauge
      );
      const mergedPool = { ...pool, ...{ gauge } };
      return mergedPool;
    });
  }

  private format(gaugeAddress: string, gaugesDatamap): GaugeInformation {
    return {
      address: gaugeAddress,
      votes: gaugesDatamap.votes.toString(),
      userVotes: gaugesDatamap.userVotes.power.toString()
    };
  }

  /**
   * @summary Fetch list of reward token addresses for gauge.
   */
  private callGaugeVotes(pools: PoolWithGauge[]) {
    pools.forEach(pool => {
      console.log("Doing pga: ", pool.gauge.address, " id: ", pool.id);
      this.multicaller.call(
        `${pool.id}.gauge.votes`,
        this.config.network.addresses.gaugeController,
        'gauge_relative_weight',
        [pool.gauge.address]
      );
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
        this.config.network.addresses.gaugeController,
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