import GaugeControllerAbi from '@/lib/abi/GaugeController.json';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import {
  GaugeInformation,
  PoolWithGauge
} from '@/services/balancer/subgraph/types';
import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Network } from '@balancer-labs/sdk';

export interface UserVotesData {
  end: BigNumber;
  power: BigNumber;
  slope: BigNumber;
}

export interface GaugeControllerData {
  votes: number;
  userVotes: UserVotesData;
  lastUserVote: BigNumber;
}

export interface GaugeControllerFormattedData {
  votes: string;
  userVotes: string;
  lastUserVote: number;
}

export type GaugeControllerDataMap = Record<string, GaugeControllerData>;

export class GaugeControllerDecorator {
  multicaller: Multicaller;
  network: Network;
  provider: JsonRpcProvider;

  constructor(
    private readonly abi = GaugeControllerAbi,
    private readonly config = configService
  ) {
    this.network = this.getNetwork();
    this.provider = rpcProviderService.getJsonProvider(this.network);
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
      GaugeControllerDataMap
    >();

    const mergedPoolMap: PoolWithGauge[] = pools.map(pool => {
      const poolGaugeDetails: GaugeInformation = {
        ...this.format(gaugesDataMap[pool.id]),
        address: pool.gauge.address
      };
      const mergedPool: PoolWithGauge = {
        ...pool,
        ...{ gauge: poolGaugeDetails }
      };
      return mergedPool;
    });
    return mergedPoolMap;
  }

  private format(
    gaugesDatamap: GaugeControllerData
  ): GaugeControllerFormattedData {
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

  /**
   * @summary Get gauge controller network.
   * @description We only have a testnet and mainnet gauge controller
   * so the network key can only be kovan (42) or mainnet (1).
   */
  private getNetwork(): Network {
    return this.config.env.NETWORK === Network.KOVAN
      ? Network.KOVAN
      : Network.MAINNET;
  }

  private resetMulticaller(): Multicaller {
    return new Multicaller(this.network.toString(), this.provider, this.abi);
  }
}

export const gaugeControllerDecorator = new GaugeControllerDecorator();
