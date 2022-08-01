import { AddressZero } from '@ethersproject/constants';

import { isL2 } from '@/composables/useNetwork';
import LiquidityGaugeAbi from '@/lib/abi/LiquidityGaugeV5.json';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

import {
  Gauge,
  OnchainGaugeData,
  OnchainGaugeDataMap,
  SubgraphGauge,
} from './types';

const MAX_REWARD_TOKENS = 8;

export class GaugesDecorator {
  multicaller: Multicaller;

  constructor(
    private readonly abi = LiquidityGaugeAbi,
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly config = configService
  ) {
    this.multicaller = this.resetMulticaller();
  }

  /**
   * @summary Combine subgraph gauge schema with onchain data using multicalls.
   */
  async decorate(
    subgraphGauges: SubgraphGauge[],
    userAddress: string
  ): Promise<Gauge[]> {
    this.multicaller = this.resetMulticaller();
    this.callRewardTokens(subgraphGauges);
    this.callClaimableTokens(subgraphGauges, userAddress);

    let gaugesDataMap = await this.multicaller.execute<OnchainGaugeDataMap>();

    this.callClaimableRewards(subgraphGauges, userAddress, gaugesDataMap);

    gaugesDataMap = await this.multicaller.execute<OnchainGaugeDataMap>(
      gaugesDataMap
    );

    return subgraphGauges.map(subgraphGauge => ({
      ...subgraphGauge,
      ...this.format(gaugesDataMap[subgraphGauge.id]),
    }));
  }

  /**
   * @summary Format raw onchain data fetched from multicalls.
   */
  private format(gaugeData: OnchainGaugeData): OnchainGaugeData {
    return {
      ...gaugeData,
      rewardTokens: this.formatRewardTokens(gaugeData.rewardTokens),
      claimableTokens: gaugeData.claimableTokens?.toString() || '0',
      claimableRewards: this.formatClaimableRewards(gaugeData.claimableRewards),
    };
  }

  /**
   * @summary Add multicaller calls that fetch list of reward token addresses for each gauge
   * in given array of gauges.
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
   * @summary Filter out zero addresses from reward tokens array.
   * @description There can be up to 8 reward tokens for a gauge.
   * The onchain call for reward tokens returns an array of length 8
   * with each position filled with the zero address if a reward token
   * has not been added.
   */
  private formatRewardTokens(rewardTokens: string[]): string[] {
    return rewardTokens.filter(token => token !== AddressZero);
  }

  /**
   * @summary Add multicaller calls that fetch the user's claimable BAL
   * for each gauge in given array of gauges.
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
   * @summary Add multicaller calls that fetch the claimable amounts for reward tokens,
   * e.g. non BAL rewards on gauge.
   */
  private callClaimableRewards(
    subgraphGauges: SubgraphGauge[],
    userAddress: string,
    gaugesDataMap: OnchainGaugeDataMap
  ) {
    const methodName = isL2.value
      ? 'claimable_reward_write'
      : 'claimable_reward';
    subgraphGauges.forEach(gauge => {
      gaugesDataMap[gauge.id].rewardTokens.forEach(rewardToken => {
        if (rewardToken === AddressZero) return;

        this.multicaller.call(
          `${gauge.id}.claimableRewards.${rewardToken}`,
          gauge.id,
          methodName,
          [userAddress, rewardToken]
        );
      });
    });
  }

  /**
   * @summary converts claimable reward values in map to strings from BigNumbers.
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

export const gaugesDecorator = new GaugesDecorator();
