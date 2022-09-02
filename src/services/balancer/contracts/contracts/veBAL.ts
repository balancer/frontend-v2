import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { formatUnits } from '@ethersproject/units';
import { parseUnits } from '@ethersproject/units';

import { toJsTimestamp, toUtcTime } from '@/composables/useTime';
import veBalAbi from '@/lib/abi/veBalAbi.json';
import { Multicaller } from '@/lib/utils/balancer/contract';

import Service from '../balancer-contracts.service';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import { ContractInterface } from 'ethers';

export type VeBalLockInfo = {
  lockedEndDate: number;
  lockedAmount: string;
  totalSupply: string;
  epoch: string;
  hasExistingLock: boolean;
  isExpired: boolean;
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
    return (toUtcTime(new Date(date)) / 1000).toString();
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

    const hasExistingLock = lockedAmount.gt(0);
    const lockedEndDateNormalised = toJsTimestamp(lockedEndDate.toNumber());
    const isExpired = hasExistingLock && Date.now() > lockedEndDateNormalised;

    return {
      lockedEndDate: lockedEndDateNormalised,
      lockedAmount: formatUnits(lockedAmount, 18),
      totalSupply: formatUnits(lockInfo.totalSupply, 18),
      epoch: lockInfo.epoch.toString(),
      hasExistingLock,
      isExpired,
    };
  }

  public async createLock(
    userProvider: Web3Provider,
    lockAmount: string,
    lockEndDate: string
  ): Promise<TransactionResponse> {
    const txBuilder = new TransactionBuilder(userProvider.getSigner());
    return await txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: veBalAbi as ContractInterface,
      action: 'create_lock',
      params: [parseUnits(lockAmount, 18), this.parseDate(lockEndDate)],
    });
  }

  public async increaseLock(
    userProvider: Web3Provider,
    lockAmount: string
  ): Promise<TransactionResponse> {
    const txBuilder = new TransactionBuilder(userProvider.getSigner());
    return await txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: veBalAbi as ContractInterface,
      action: 'increase_amount',
      params: [parseUnits(lockAmount, 18)],
    });
  }

  public async extendLock(
    userProvider: Web3Provider,
    lockEndDate: string
  ): Promise<TransactionResponse> {
    const txBuilder = new TransactionBuilder(userProvider.getSigner());
    return await txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: veBalAbi as ContractInterface,
      action: 'increase_unlock_time',
      params: [this.parseDate(lockEndDate)],
    });
  }

  public async unlock(
    userProvider: Web3Provider
  ): Promise<TransactionResponse> {
    const txBuilder = new TransactionBuilder(userProvider.getSigner());
    return await txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: veBalAbi as ContractInterface,
      action: 'withdraw',
    });
  }

  public get address(): string {
    return this.service.config.addresses.veBAL;
  }
}
