import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { call, Multicaller } from '@/lib/utils/balancer/contract';
import { default as FreshBeetsAbi } from '@/beethovenx/abi/FreshBeets.json';
import { default as ERC20Abi } from '@/lib/abi/ERC20.json';
import { BigNumber } from 'ethers';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { Web3Provider } from '@ethersproject/providers';

export default class FreshBeets {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  public async getData(
    account: string
  ): Promise<{
    totalSupply: BigNumber;
    totalVestedAmount: BigNumber;
    userBalance: BigNumber;
    userBptTokenBalance: BigNumber;
    allowance: BigNumber;
  }> {
    const multicaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      FreshBeetsAbi
    );

    multicaller.call('totalSupply', this.fbeetsAddress, 'totalSupply', []);
    multicaller.call(
      'totalVestedAmount',
      this.vestingTokenAddress,
      'balanceOf',
      [this.fbeetsAddress]
    );
    multicaller.call('userBalance', this.fbeetsAddress, 'balanceOf', [account]);
    multicaller.call(
      'userBptTokenBalance',
      this.vestingTokenAddress,
      'balanceOf',
      [account]
    );
    multicaller.call('allowance', this.vestingTokenAddress, 'allowance', [
      account,
      this.fbeetsAddress
    ]);

    return multicaller.execute();
  }

  public async getTotalFreshBeetsSupply(): Promise<BigNumber> {
    return await call(this.service.provider, FreshBeetsAbi, [
      this.fbeetsAddress,
      'totalSupply'
    ]);
  }

  public async getTotalVestedTokenAmount(): Promise<BigNumber> {
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

  public async bptBalanceOf(account: string): Promise<BigNumber> {
    return await call(this.service.provider, ERC20Abi, [
      this.vestingTokenAddress,
      'balanceOf',
      [account]
    ]);
  }

  public async enter(provider: Web3Provider, amount: BigNumber) {
    return sendTransaction(
      provider,
      this.fbeetsAddress,
      FreshBeetsAbi,
      'enter',
      [amount]
    );
  }

  public async leave(provider: Web3Provider, amount: BigNumber) {
    return sendTransaction(
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
