import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { default as MasterChefAbi } from '@/beethovenx/abi/BeethovenxMasterChef.json';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { Web3Provider } from '@ethersproject/providers';
import { getAddress, isAddress } from '@ethersproject/address';
import { scale } from '@/lib/utils';
import BigNumber from 'bignumber.js';

export default class MasterChef {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  public async getPendingBeetsForFarm(
    id: string,
    user: string
  ): Promise<number> {
    let result = {} as Record<any, any>;

    if (!isAddress(user)) {
      return 0;
    }

    const masterChefMultiCaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      MasterChefAbi
    );

    masterChefMultiCaller.call('pendingBeets', this.address, 'pendingBeets', [
      id,
      getAddress(user)
    ]);
    result = await masterChefMultiCaller.execute(result);

    const pendingBeets = result.pendingBeets?.toString();

    return pendingBeets
      ? scale(new BigNumber(pendingBeets), -18).toNumber()
      : 0;
  }

  public async withdrawAndHarvest(
    provider: Web3Provider,
    farmId: string,
    amount: string,
    to: string
  ) {
    return sendTransaction(
      provider,
      this.address,
      MasterChefAbi,
      'withdrawAndHarvest',
      [farmId, amount.toString(), to]
    );
  }

  public async harvest(provider: Web3Provider, farmId: string, to: string) {
    return sendTransaction(provider, this.address, MasterChefAbi, 'harvest', [
      farmId,
      to
    ]);
  }

  public async harvestAll(
    provider: Web3Provider,
    farmIds: string[],
    to: string
  ) {
    return sendTransaction(
      provider,
      this.address,
      MasterChefAbi,
      'harvestAll',
      [farmIds, to]
    );
  }

  public async deposit(
    provider: Web3Provider,
    pid: string,
    amount: string | number,
    to: string
  ) {
    return sendTransaction(provider, this.address, MasterChefAbi, 'deposit', [
      pid,
      amount.toString(),
      to
    ]);
    // masterChefMultiCaller.call('deposit', this.address, 'deposit', [
    //   pid,
    //   amount.toString(),
    //   to
    // ]);
    // await masterChefMultiCaller.execute();
  }

  public get address(): string {
    return this.service.config.addresses.masterChef || '';
  }
}
