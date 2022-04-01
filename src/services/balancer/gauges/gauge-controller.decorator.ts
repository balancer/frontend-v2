import GaugeControllerAbi from '@/lib/abi/GaugeController.json';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { BigNumber, parseFixed } from '@ethersproject/bignumber';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Network } from '@balancer-labs/sdk';
import { VotingGauge } from '@/constants/voting-gauges';
import { oneWeekInMs, toUnixTimestamp } from '@/composables/useTime';

const VOTE_MULTIPLIER = parseFixed('1', 18);

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
  gaugeWeightThisPeriod: Point;
  gaugeWeightNextPeriod: Point;
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
  totalWeightThisPeriod: Point;
  totalWeightNextPeriod: Point;
  gauges: Record<string, RawVotesData>;
}

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
    this.callGaugeWeightThisPeriod(votingGauges);
    this.callGaugeWeightNextPeriod(votingGauges);
    this.callTotalWeightThisPeriod();
    this.callTotalWeightNextPeriod();
    if (userAddress) {
      this.callUserGaugeVotes(votingGauges, userAddress);
      this.callUserGaugeVoteTime(votingGauges, userAddress);
    }

    const votesDataMap = await this.multicaller.execute<RawVotesDataMap>();

    const decoratedGauges = votingGauges.map(gauge => {
      return {
        ...gauge,
        ...this.formatVotes(
          votesDataMap.totalWeightThisPeriod.bias,
          votesDataMap.totalWeightNextPeriod.bias,
          votesDataMap.gauges[gauge.address]
        )
      };
    });
    return decoratedGauges;
  }

  private formatVotes(
    totalWeightThisPeriod: BigNumber,
    totalWeightNextPeriod: BigNumber,
    votesData: RawVotesData
  ): VotesData {
    const multiplier = VOTE_MULTIPLIER.mul(
      this.config.network.gauges.weight
    ).div(100);
    return {
      votes: votesData.gaugeWeightThisPeriod.bias
        .mul(multiplier)
        .div(totalWeightThisPeriod)
        .toString(),
      votesNextPeriod: votesData.gaugeWeightNextPeriod.bias
        .mul(multiplier)
        .div(totalWeightNextPeriod)
        .toString(),
      userVotes: votesData?.userVotes?.power.toString() || '0',
      lastUserVoteTime: votesData?.lastUserVoteTime?.toNumber() || 0
    };
  }

  /**
   * @summary Fetch total points allocated towards each gauge for this period
   */
  private callGaugeWeightThisPeriod(votingGauges: VotingGauge[]) {
    const thisWeekTimestamp = toUnixTimestamp(
      Math.floor(Date.now() / oneWeekInMs) * oneWeekInMs
    );
    votingGauges.forEach(gauge => {
      this.multicaller.call(
        `gauges.${gauge.address}.gaugeWeightThisPeriod`,
        this.config.network.addresses.gaugeController,
        'points_weight',
        [gauge.address, thisWeekTimestamp]
      );
    });
  }

  /**
   * @summary Fetch total points allocated towards each gauge for next period (+1 week)
   */
  private callGaugeWeightNextPeriod(votingGauges: VotingGauge[]) {
    const nextWeekTimestamp = toUnixTimestamp(
      Math.floor((Date.now() + oneWeekInMs) / oneWeekInMs) * oneWeekInMs
    );
    votingGauges.forEach(gauge => {
      this.multicaller.call(
        `gauges.${gauge.address}.gaugeWeightNextPeriod`,
        this.config.network.addresses.gaugeController,
        'points_weight',
        [gauge.address, nextWeekTimestamp]
      );
    });
  }

  /**
   * @summary Fetch total points allocated towards all gauges on this network for this period
   */
  private callTotalWeightThisPeriod() {
    const thisWeekTimestamp = toUnixTimestamp(
      Math.floor(Date.now() / oneWeekInMs) * oneWeekInMs
    );
    this.multicaller.call(
      `totalWeightThisPeriod`,
      this.config.network.addresses.gaugeController,
      'points_sum',
      [this.config.network.gauges.type, thisWeekTimestamp]
    );
  }

  /**
   * @summary Fetch total points allocated towards all gauges on this network for next period (+1 week)
   */
  private callTotalWeightNextPeriod() {
    const nextWeekTimestamp = toUnixTimestamp(
      Math.floor((Date.now() + oneWeekInMs) / oneWeekInMs) * oneWeekInMs
    );
    this.multicaller.call(
      `totalWeightNextPeriod`,
      this.config.network.addresses.gaugeController,
      'points_sum',
      [this.config.network.gauges.type, nextWeekTimestamp]
    );
  }

  /**
   * @summary Fetch user's vote weight for each gauge
   */
  private callUserGaugeVotes(votingGauges: VotingGauge[], userAddress: string) {
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
   * @summary Fetch user's vote weight for each gauge
   */
  private callUserGaugeVoteTime(
    votingGauges: VotingGauge[],
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
