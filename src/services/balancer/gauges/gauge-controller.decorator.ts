import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcProvider } from '@ethersproject/providers';

import {
  oneWeekInMs,
  oneWeekInSecs,
  toUnixTimestamp,
} from '@/composables/useTime';
import GaugeControllerAbi from '@/lib/abi/GaugeController.json';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { getOldMulticaller } from '@/dependencies/OldMulticaller';
// eslint-disable-next-line no-restricted-imports
import { Multicaller } from '@/lib/utils/balancer/contract';
import { networkId, isTestnet } from '@/composables/useNetwork';
import { Network } from '@/lib/config/types';
import {
  ApiVotingPools,
  ApiVotingGauge,
} from '@/composables/queries/useVotingPoolsQuery';

const FIRST_WEEK_TIMESTAMP = 1648684800;

export interface UserVotesData {
  end: BigNumber;
  power: BigNumber;
  slope: BigNumber;
}

export interface Point {
  bias: BigNumber;
  slope: BigNumber;
}

export interface RawVotesData {
  gaugeWeightThisPeriod: BigNumber;
  gaugeWeightNextPeriod: BigNumber;
  userVotes: UserVotesData;
  lastUserVoteTime: BigNumber;
}

export interface VotesData {
  votes: string;
  votesNextPeriod: string;
  userVotes: string;
  lastUserVoteTime: number;
}

export interface RawVotesDataMap {
  gauges: Record<string, RawVotesData>;
}

export type ApiVotingPool = ApiVotingPools[number];
export type VotingPoolWithVotes = ApiVotingPool & VotesData;

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
   * @summary Decorate subgraph voting pool schema with onchain data using multicalls.
   */
  async decorateWithVotes(
    votingPools: ApiVotingPools,
    userAddress: string
  ): Promise<VotingPoolWithVotes[]> {
    const votingGauges = votingPools.map(pool => pool.gauge);
    this.multicaller = this.resetMulticaller();
    this.callGaugeWeightThisPeriod(votingGauges);
    this.callGaugeWeightNextPeriod(votingGauges);
    if (userAddress) {
      this.callUserGaugeVotes(votingGauges, userAddress);
      this.callUserGaugeVoteTime(votingGauges, userAddress);
    }

    const votesDataMap = await this.multicaller.execute<RawVotesDataMap>();

    const decoratedVotingPools = votingPools.map(pool => {
      return {
        ...pool,
        ...this.formatVotes(votesDataMap.gauges[pool.gauge.address]),
      };
    });
    return decoratedVotingPools;
  }

  private formatVotes(votesData: RawVotesData): VotesData {
    const votes = votesData.gaugeWeightThisPeriod.toString();
    const votesNextPeriod = votesData.gaugeWeightNextPeriod.toString();

    return {
      votes,
      votesNextPeriod,
      userVotes: votesData?.userVotes?.power.toString() || '0',
      lastUserVoteTime: votesData?.lastUserVoteTime?.toNumber() || 0,
    };
  }

  /**
   * @summary Fetch total points allocated towards each gauge for this period
   */
  private callGaugeWeightThisPeriod(votingGauges: ApiVotingGauge[]) {
    let thisWeekTimestamp = toUnixTimestamp(
      Math.floor(Date.now() / oneWeekInMs) * oneWeekInMs
    );
    // this makes sure we don't compute votes from before Mar31 in the "This period" entry,
    // since the system is not fully active between Mar31 and Apr6
    // (ie the first period starts on Apr7)
    if (thisWeekTimestamp == FIRST_WEEK_TIMESTAMP) {
      thisWeekTimestamp = thisWeekTimestamp - oneWeekInSecs;
    }
    votingGauges.forEach(gauge => {
      this.multicaller.call(
        `gauges.${gauge.address}.gaugeWeightThisPeriod`,
        this.config.network.addresses.gaugeController,
        'gauge_relative_weight_write',
        [gauge.address, thisWeekTimestamp]
      );
    });
  }

  /**
   * @summary Fetch total points allocated towards each gauge for next period (+1 week)
   */
  private callGaugeWeightNextPeriod(votingGauges: ApiVotingGauge[]) {
    const nextWeekTimestamp = toUnixTimestamp(
      Math.floor((Date.now() + oneWeekInMs) / oneWeekInMs) * oneWeekInMs
    );
    votingGauges.forEach(gauge => {
      this.multicaller.call(
        `gauges.${gauge.address}.gaugeWeightNextPeriod`,
        this.config.network.addresses.gaugeController,
        'gauge_relative_weight_write',
        [gauge.address, nextWeekTimestamp]
      );
    });
  }

  /**
   * @summary Fetch user's vote weight for each gauge
   */
  private callUserGaugeVotes(
    votingGauges: ApiVotingGauge[],
    userAddress: string
  ) {
    votingGauges.forEach(gauge => {
      this.multicaller.call(
        `gauges.${gauge.address}.userVotes`,
        this.config.network.addresses.gaugeController,
        'vote_user_slopes',
        [userAddress, gauge.address]
      );
    });
  }

  /**
   * @summary Fetch user's vote time for each gauge
   */
  private callUserGaugeVoteTime(
    votingGauges: ApiVotingGauge[],
    userAddress: string
  ) {
    votingGauges.forEach(gauge => {
      this.multicaller.call(
        `gauges.${gauge.address}.lastUserVoteTime`,
        this.config.network.addresses.gaugeController,
        'last_user_vote',
        [userAddress, gauge.address]
      );
    });
  }

  /**
   * @summary Get gauge controller network.
   * @description We only have a testnet and mainnet gauge controller
   * so the network key can only be goerli (5) or mainnet (1).
   */
  private getNetwork(): Network {
    if (isTestnet.value) {
      return networkId.value;
    } else {
      return Network.MAINNET;
    }
  }

  private resetMulticaller() {
    const Multicaller = getOldMulticaller();
    return new Multicaller(this.network.toString(), this.provider, this.abi);
  }
}
