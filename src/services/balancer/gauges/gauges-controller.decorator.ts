import LiquidityGaugeAbi from '@/lib/abi/LiquidityGaugeV5.json';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { AddressZero } from '@ethersproject/constants';
import {
  Gauge,
  OnchainGaugeData,
  OnchainGaugeDataMap,
  SubgraphGauge
} from './types';

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
    subgraphGauges: SubgraphGauge[],
    userAddress: string
  ): Promise<Gauge[]> {
    this.resetMulticaller();
    this.callGaugeVotes(subgraphGauges);
    this.callUserGaugeVotes(subgraphGauges, userAddress);

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
   * @summary Format raw onchain data fetched from multicalls.
   */
  private format(gaugeData: OnchainGaugeData): OnchainGaugeData {
    return {
      ...gaugeData,
      rewardTokens: this.formatRewardTokens(gaugeData.rewardTokens),
      claimableTokens: gaugeData.claimableTokens.toString(),
      claimableRewards: this.formatClaimableRewards(gaugeData.claimableRewards)
    };
  }

  /**
   * @summary Fetch list of reward token addresses for gauge.
   */
  private callRewardTokens(subgraphGauges: SubgraphGauge[]) {
    subgraphGauges.forEach(gauge => {
      for (let i = 0; i < MAX_REWARD_TOKENS; i++) {
        this.multicaller.call(
          `${gauge.id}.rewardTokens[${i}]`,
          gauge.id,
          'reward_tokens',
          [i]
        );
      }
    });
  }

  /**
   * @summary The rewardTokens array is filled with the zero address
   * if no reward tokens have been added.
   */
  private formatRewardTokens(rewardTokens: string[]): string[] {
    return rewardTokens.filter(token => token !== AddressZero);
  }

  /**
   * @summary Fetch user's claimable BAL for each gauge.
   */
  private callClaimableTokens(
    subgraphGauges: SubgraphGauge[],
    userAddress: string
  ) {
    subgraphGauges.forEach(gauge => {
      this.multicaller.call(
        `${gauge.id}.claimableTokens`,
        gauge.id,
        'claimable_tokens',
        [userAddress]
      );
    });
  }

  /**
   * @summary Fetch claimable amounts for reward tokens,
   * e.g. non BAL rewards on gauge.
   */
  private callClaimableRewards(
    subgraphGauges: SubgraphGauge[],
    userAddress: string,
    gaugesDataMap: OnchainGaugeDataMap
  ) {
    subgraphGauges.forEach(gauge => {
      gaugesDataMap[gauge.id].rewardTokens.forEach(rewardToken => {
        if (rewardToken === AddressZero) return;

        this.multicaller.call(
          `${gauge.id}.claimableRewards.${rewardToken}`,
          gauge.id,
          'claimable_reward',
          [userAddress, rewardToken]
        );
      });
    });
  }

  /**
   * @summary Convert BigNumbers to strings
   */
  private formatClaimableRewards(
    claimableRewards: Record<string, string>
  ): Record<string, string> {
    if (!claimableRewards) return {};

    Object.keys(claimableRewards).forEach(rewardToken => {
      claimableRewards[rewardToken] = claimableRewards[rewardToken].toString();
    });

    return claimableRewards;
  }

  private resetMulticaller(): Multicaller {
    return new Multicaller(this.config.network.key, this.provider, this.abi);
  }
}

export const gaugesControllerDecorator = new GaugesControllerDecorator();