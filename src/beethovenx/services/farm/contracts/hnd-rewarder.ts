import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { default as TimeBasedRewarder } from '@/beethovenx/abi/TimeBasedRewarder.json';
import { getAddress } from '@ethersproject/address';
import { scale } from '@/lib/utils';
import BigNumber from 'bignumber.js';

export default class HndRewarder {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  public async getPendingReward(id: string, user: string): Promise<number> {
    let result = {} as Record<any, any>;

    const rewarderMulticaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      TimeBasedRewarder
    );

    rewarderMulticaller.call('pendingToken', this.address, 'pendingToken', [
      id,
      getAddress(user)
    ]);

    result = await rewarderMulticaller.execute(result);

    const pendingReward = result.pendingToken.toString();

    return pendingReward
      ? scale(new BigNumber(pendingReward), -18).toNumber()
      : 0;
  }

  public async getRewardPerSecond(): Promise<number> {
    let result = {} as Record<any, any>;

    const rewarderMulticaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      TimeBasedRewarder
    );

    rewarderMulticaller.call(
      'rewardPerSecond',
      this.address,
      'rewardPerSecond',
      []
    );

    result = await rewarderMulticaller.execute(result);

    const rewardPerSecond = result.rewardPerSecond.toString();

    return rewardPerSecond
      ? scale(new BigNumber(rewardPerSecond), -18).toNumber()
      : 0;
  }

  public get address(): string {
    return this.service.config.addresses.hndRewarder || '';
  }
}
