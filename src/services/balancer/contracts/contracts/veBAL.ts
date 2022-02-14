import { Multicaller } from '@/lib/utils/balancer/contract';
import { sendTransaction } from '@/lib/utils/balancer/web3';

import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { Web3Provider } from '@ethersproject/providers';
import { parseUnits } from '@ethersproject/units';

import veBalAbi from '@/lib/abi/veBalAbi.json';

import Service from '../balancer-contracts.service';
import { unixToJsTime } from '@/lib/utils/date';

export type VeBalLockInfo = {
  lockedEndDate: number;
  lockedAmount: string;
  totalSupply: string;
  epoch: string;
  hasExistingLock: boolean;
};

type VeBalLockInfoResult = {
  locked: BigNumber[];
  epoch: BigNumber;
  totalSupply: BigNumber;
};

export default class VeBAL {
  service: Service;

  constructor(service: Service) {
    this.service = service;
  }

  private parseDate(date: string) {
    return (new Date(date).getTime() / 1000).toString();
  }

  public async getLockInfo(account: string): Promise<VeBalLockInfo> {
    const veBalMulticaller = new Multicaller(
      this.service.config.key,
      this.service.provider,
      veBalAbi
    );

    veBalMulticaller.call('locked', this.address, 'locked', [account]);
    veBalMulticaller.call('epoch', this.address, 'epoch');
    veBalMulticaller.call('totalSupply', this.address, 'totalSupply()');

    const result = await veBalMulticaller.execute<VeBalLockInfoResult>();

    return this.formatLockInfo(result);
  }

  public formatLockInfo(lockInfo: VeBalLockInfoResult) {
    const [lockedAmount, lockedEndDate] = lockInfo.locked;

    return {
      lockedEndDate: unixToJsTime(lockedEndDate.toNumber()),
      lockedAmount: formatUnits(lockedAmount, 18),
      totalSupply: formatUnits(lockInfo.totalSupply, 18),
      epoch: lockInfo.epoch.toString(),
      hasExistingLock: lockedAmount.gt(0)
    };
  }

  public createLock(
    userProvider: Web3Provider,
    lockAmount: string,
    lockEndDate: string
  ) {
    return sendTransaction(
      userProvider,
      this.address,
      veBalAbi,
      'create_lock',
      [parseUnits(lockAmount, 18), this.parseDate(lockEndDate)]
    );
  }

  public increaseLock(userProvider: Web3Provider, lockAmount: string) {
    return sendTransaction(
      userProvider,
      this.address,
      veBalAbi,
      'increase_amount',
      [parseUnits(lockAmount, 18)]
    );
  }

  public extendLock(userProvider: Web3Provider, lockEndDate: string) {
    return sendTransaction(
      userProvider,
      this.address,
      veBalAbi,
      'increase_unlock_time',
      [this.parseDate(lockEndDate)]
    );
  }

  public get address(): string {
    return this.service.config.addresses.veBAL;
  }
}
