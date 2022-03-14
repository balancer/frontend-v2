import GaugeControllerAbi from '@/lib/abi/GaugeController.json';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import {
  GaugeInformation,
  PoolWithGauge
} from '@/services/balancer/subgraph/types';
import { BigNumber } from '@ethersproject/bignumber';

export interface UserVotesData {
  end: BigNumber;
  power: BigNumber;
  slope: BigNumber;
}

export interface OnchainGaugeControllerData {
  votes: number;
  userVotes: UserVotesData;
  lastUserVote: BigNumber;
}

export interface OnchainGaugeControllerFormattedData {
  votes: string;
  userVotes: string;
  lastUserVote: number;
}

export type OnchainGaugeControllerDataMap = Record<
  string,
  OnchainGaugeControllerData
>;

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
    this.callUserGaugeVoteTime(pools, userAddress);

    const gaugesDataMap = await this.multicaller.execute<
      OnchainGaugeControllerDataMap
    >();

    const mergedPoolMap = pools.map(pool => {
      const poolGaugeDetails = {
        ...this.format(gaugesDataMap[pool.id]),
        address: pool.gauge.address
      };
      const mergedPool = {
        ...pool,
        ...{ gauge: poolGaugeDetails }
      };
      return mergedPool;
    });
    console.log('Merged pool map: ', mergedPoolMap);
    return mergedPoolMap;
  }

  private format(
    gaugesDatamap: OnchainGaugeControllerData
  ): OnchainGaugeControllerFormattedData {
    return {
      votes: gaugesDatamap.votes.toString(),
      userVotes: gaugesDatamap.userVotes.power.toString(),
      lastUserVote: gaugesDatamap.lastUserVote.toNumber()
    };
  }

  /**
   * @summary Fetch relative vote weight of each gauge
   */
  private callGaugeVotes(pools: PoolWithGauge[]) {
    pools.forEach(pool => {
      this.multicaller.call(
        `${pool.id}.votes`,
        this.config.network.addresses.gaugeController,
        'gauge_relative_weight',
        [pool.gauge.address]
      );
    });
  }

  /**
   * @summary Fetch user's vote weight for each gauge
   */
  private callUserGaugeVotes(pools: PoolWithGauge[], userAddress: string) {
    pools.forEach(pool => {
      this.multicaller.call(
        `${pool.id}.userVotes`,
        this.config.network.addresses.gaugeController,
        'vote_user_slopes',
        [userAddress, pool.gauge.address]
      );
    });
  }

  /**
   * @summary Fetch user's vote weight for each gauge
   */
  private callUserGaugeVoteTime(pools: PoolWithGauge[], userAddress: string) {
    pools.forEach(pool => {
      this.multicaller.call(
        `${pool.id}.lastUserVote`,
        this.config.network.addresses.gaugeController,
        'last_user_vote',
        [userAddress, pool.gauge.address]
      );
    });
  }

  private resetMulticaller(): Multicaller {
    return new Multicaller(this.config.network.key, this.provider, this.abi);
  }
}

export const gaugesControllerDecorator = new GaugesControllerDecorator();
