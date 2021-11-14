import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { default as abi, default as erc20Abi } from '@/lib/abi/ERC20.json';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { BigNumber } from '@ethersproject/bignumber';
import { MaxUint256 } from '@ethersproject/constants';

export default class Erc20 {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  public async allowance(
    tokenAddress: string,
    owner: string,
    spender: string
  ): Promise<BigNumber> {
    const multicaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      erc20Abi
    );

    const result = await multicaller
      .call('allowance', tokenAddress, 'allowance', [owner, spender])
      .execute();

    return result.allowance;
  }

  async approveToken(
    web3: Web3Provider,
    spender: string,
    token: string,
    amount: string = MaxUint256.toString()
  ): Promise<TransactionResponse> {
    return sendTransaction(web3, token, abi, 'approve', [spender, amount]);
  }

  async balanceOf(tokenAddress: string, user: string): Promise<string> {
    const multicaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      erc20Abi
    );

    const result = await multicaller
      .call('balanceOf', tokenAddress, 'balanceOf', [user])
      .execute();

    return result.balanceOf.toString();
  }
}
