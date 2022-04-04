import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { default as TimeBasedRewarder } from '@/beethovenx/abi/TimeBasedRewarder.json';
import { getAddress, isAddress } from '@ethersproject/address';
import { scale } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import { mapValues, uniqBy } from 'lodash';
import { GqlBeetsFarm } from '@/beethovenx/services/beethovenx/beethovenx-types';

export interface MasterChefRewarderPendingToken {
  address: string;
  balance: string;
  balanceUSD: string;
  symbol: string;
}

export default class MasterChefRewarders {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  public async getPendingRewards(
    farmIds: string[],
    rewarders: string[],
    user: string,
    farms: GqlBeetsFarm[]
  ): Promise<{
    [farmId: string]: MasterChefRewarderPendingToken[];
  }> {
    const rewardTokens = uniqBy(
      farms.map(farm => farm.rewardTokens).flat(),
      token => token.address
    );
    let result = {} as Record<any, any>;

    if (!isAddress(user)) {
      return {};
    }

    const rewarderMulticaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      TimeBasedRewarder
    );

    for (const rewarder of rewarders) {
      for (const id of farmIds) {
        rewarderMulticaller.call(
          `${id}.${rewarder}.pendingToken`,
          rewarder,
          'pendingToken',
          [id, getAddress(user)]
        );

        rewarderMulticaller.call(
          `${id}.${rewarder}.pendingTokens`,
          rewarder,
          'pendingTokens',
          [id, getAddress(user), 0]
        );
      }
    }

    result = await rewarderMulticaller.execute(result);

    //each farm can have only one rewarder
    const mapped = mapValues(result, (farm, farmId) => {
      for (const _item of Object.values(farm)) {
        const item = _item as any;

        const rewards: MasterChefRewarderPendingToken[] = [];

        item.pendingTokens.rewardTokens.forEach(
          (address: string, idx: number) => {
            const rewardToken = rewardTokens.find(
              rewardToken =>
                rewardToken.address.toLowerCase() === address.toLowerCase()
            );
            const rewardAmount = item.pendingTokens.rewardAmounts[idx];

            if (rewardAmount && rewardAmount.toString() !== '0') {
              const balance = scale(
                new BigNumber(rewardAmount.toString()),
                farmId === '66' ? -6 : -18
              ).toString();

              rewards.push({
                address: getAddress(address),
                symbol: rewardToken?.symbol || '',
                balance,
                balanceUSD: `${parseFloat(balance) *
                  parseFloat(rewardToken?.tokenPrice || '0')}`
              });
            }
          }
        );

        if (rewards.length > 0) {
          return rewards;
        }
      }

      return [];
    });

    return mapped;
  }
}
