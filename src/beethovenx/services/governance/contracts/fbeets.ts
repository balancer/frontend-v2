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
    totalFbeetsSupply: BigNumber;
    totalBptStaked: BigNumber;
    userBalance: BigNumber;
    userBptTokenBalance: BigNumber;
    allowance: BigNumber;
  }> {
    const multicaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      FreshBeetsAbi
    );

    multicaller.call(
      'totalFbeetsSupply',
      this.fbeetsAddress,
      'totalSupply',
      []
    );
    multicaller.call('totalBptStaked', this.bptTokenAddress, 'balanceOf', [
      this.fbeetsAddress
    ]);
    multicaller.call('userBalance', this.fbeetsAddress, 'balanceOf', [account]);
    multicaller.call('userBptTokenBalance', this.bptTokenAddress, 'balanceOf', [
      account
    ]);
    multicaller.call('allowance', this.bptTokenAddress, 'allowance', [
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
      this.bptTokenAddress,
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
      this.bptTokenAddress,
      'balanceOf',
      [account]
    ]);
  }

  public async enter(provider: Web3Provider, amount: string) {
    return sendTransaction(
      provider,
      this.fbeetsAddress,
      FreshBeetsAbi,
      'enter',
      [BigNumber.from(amount)]
    );
  }

  public async leave(provider: Web3Provider, amount: string) {
    return sendTransaction(
      provider,
      this.fbeetsAddress,
      FreshBeetsAbi,
      'leave',
      [BigNumber.from(amount)]
    );
  }

  public get fbeetsAddress(): string {
    return this.service.config.fBeets.address || '';
  }
  public get bptTokenAddress(): string {
    return this.service.config.fBeets.poolAddress || '';
  }
}
