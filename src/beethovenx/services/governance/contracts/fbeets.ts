import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { call } from '@/lib/utils/balancer/contract';
import { default as FreshBeetsAbi } from '@/beethovenx/abi/FreshBeets.json';
import { BigNumber } from 'ethers';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { Web3Provider } from '@ethersproject/providers';

export default class FreshBeets {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  public async getTotalFreshBeetsSupply(): Promise<BigNumber> {
    return await call(this.service.provider, FreshBeetsAbi, [
      this.fbeetsAddress,
      'totalSupply'
    ]);
  }

  public async getTotalVestedTokenAmount(): Promise<BigNumber> {
    console.log('calling');
    return await call(this.service.provider, FreshBeetsAbi, [
      this.vestingTokenAddress,
      'balanceOf',
      [this.fbeetsAddress]
    ]);
  }

  public async fBeetsBalanceOf(account: string): Promise<BigNumber> {
    return await call(this.service.provider, FreshBeetsAbi, [
      this.fbeetsAddress,
      'balanceOf',
      [account]
    ]);
  }

  public async enter(provider: Web3Provider, amount: BigNumber): Promise<void> {
    await sendTransaction(
      provider,
      this.fbeetsAddress,
      FreshBeetsAbi,
      'enter',
      [amount]
    );
  }

  public async leave(provider: Web3Provider, amount: BigNumber): Promise<void> {
    await sendTransaction(
      provider,
      this.fbeetsAddress,
      FreshBeetsAbi,
      'leave',
      [amount]
    );
  }

  public get fbeetsAddress(): string {
    return this.service.config.addresses.fbeetsToken || '';
  }
  public get vestingTokenAddress(): string {
    return this.service.config.addresses.fbeetsVestingToken || '';
  }
}
