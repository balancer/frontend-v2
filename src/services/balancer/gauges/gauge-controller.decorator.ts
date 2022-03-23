import GaugeControllerAbi from '@/lib/abi/GaugeController.json';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Network } from '@balancer-labs/sdk';
import { VotingGauge } from '@/constants/voting-gauges';
import { oneWeekInMs, toUnixTimestamp } from '@/composables/useTime';

export interface UserVotesData {
  end: BigNumber;
  power: BigNumber;
  slope: BigNumber;
}

export interface RawVotesData {
  votes: number;
  votesNextPeriod: number;
  userVotes: UserVotesData;
  lastUserVoteTime: BigNumber;
}

export interface VotesData {
  votes: string;
  votesNextPeriod: string;
  userVotes: string;
  lastUserVoteTime: number;
}

export type RawVotesDataMap = Record<string, RawVotesData>;

export type VotingGaugeWithVotes = VotingGauge & VotesData;

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
  async decorateWithVotes(
    votingGauges: VotingGauge[],
    userAddress: string
  ): Promise<VotingGaugeWithVotes[]> {
    this.multicaller = this.resetMulticaller();
    this.callGaugeVotes(votingGauges);
    this.callGaugeVotesNextPeriod(votingGauges);
    if (userAddress) {
      this.callUserGaugeVotes(votingGauges, userAddress);
      this.callUserGaugeVoteTime(votingGauges, userAddress);
    }

    const votesDataMap = await this.multicaller.execute<RawVotesDataMap>();

    return votingGauges.map(gauge => {
      return {
        ...gauge,
        ...this.formatVotes(votesDataMap[gauge.address])
      };
    });
  }

  private formatVotes(votesData: RawVotesData): VotesData {
    return {
      votes: votesData.votes.toString(),
      votesNextPeriod: votesData.votesNextPeriod.toString(),
      userVotes: votesData?.userVotes?.power.toString() || '0',
      lastUserVoteTime: votesData?.lastUserVoteTime?.toNumber() || 0
    };
  }

  /**
   * @summary Fetch relative vote weight of each gauge
   */
  private callGaugeVotes(votingGauges: VotingGauge[]) {
    votingGauges.forEach(gauge => {
      this.multicaller.call(
        `${gauge.address}.votes`,
        this.config.network.addresses.gaugeController,
        'gauge_relative_weight',
        [gauge.address, toUnixTimestamp(Date.now())]
      );
    });
  }

  /**
   * @summary Fetch relative vote weight of each gauge for next period (1 week)
   */
  private callGaugeVotesNextPeriod(votingGauges: VotingGauge[]) {
    const oneWeekFromNow = toUnixTimestamp(Date.now() + oneWeekInMs);
    votingGauges.forEach(gauge => {
      this.multicaller.call(
        `${gauge.address}.votesNextPeriod`,
        this.config.network.addresses.gaugeController,
        'gauge_relative_weight',
        [gauge.address, oneWeekFromNow]
      );
    });
  }

  /**
   * @summary Fetch user's vote weight for each gauge
   */
  private callUserGaugeVotes(votingGauges: VotingGauge[], userAddress: string) {
    votingGauges.forEach(gauge => {
      this.multicaller.call(
        `${gauge.address}.userVotes`,
        this.config.network.addresses.gaugeController,
        'vote_user_slopes',
        [userAddress, gauge.address]
      );
    });
  }

  /**
   * @summary Fetch user's vote weight for each gauge
   */
  private callUserGaugeVoteTime(
    votingGauges: VotingGauge[],
    userAddress: string
  ) {
    votingGauges.forEach(gauge => {
      this.multicaller.call(
        `${gauge.address}.lastUserVoteTime`,
        this.config.network.addresses.gaugeController,
        'last_user_vote',
        [userAddress, gauge.address]
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
