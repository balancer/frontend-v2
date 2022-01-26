import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { default as TimeBasedRewarder } from '@/beethovenx/abi/TimeBasedRewarder.json';
import { getAddress, isAddress } from '@ethersproject/address';
import { scale } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import { mapValues } from 'lodash';

export default class MasterChefRewarders {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  public async getPendingRewards(
    farmIds: string[],
    rewarders: string[],
    user: string
  ): Promise<{ [id: string]: number }> {
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
      }
    }

    result = await rewarderMulticaller.execute(result);

    //each farm can have only one rewarder
    const mapped = mapValues(result, farm => {
      for (const _item of Object.values(farm)) {
        const item = _item as any;

        const pendingToken = item.pendingToken
          ? scale(new BigNumber(item.pendingToken.toString()), -18).toNumber()
          : 0;

        if (pendingToken > 0) {
          return pendingToken;
        }
      }

      return 0;
    });

    return mapped;
  }
}
