import { FundManagement, TransactionData } from '@balancer-labs/sdk';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { Contract } from 'ethers';

import BatchRelayerAbi from '@/lib/abi/BatchRelayer.json';

import ContractService from '../balancer-contracts.service';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';

export default class BatchRelayer {
  service: ContractService;
  instance: Contract;

  constructor(service, public readonly abi = BatchRelayerAbi) {
    this.service = service;

    if (!this.service.config.addresses.batchRelayer)
      throw new Error('BatchRelayer address not set');

    this.instance = new Contract(
      this.service.config.addresses.batchRelayer,
      this.abi,
      this.service.provider
    );
  }

  public get address(): string {
    return this.service.config.addresses.batchRelayer;
  }

  public async stableExitStatic(
    account: string,
    tokenIn: string,
    amountsIn: string[],
    tokensOut: string[],
    rates: string[],
    slippage: string,
    exactOut = false,
    fetchPools = true
  ): Promise<TransactionData> {
    const funds: FundManagement = {
      sender: account,
      recipient: this.address, // Note relayer is recipient of swaps
      fromInternalBalance: false,
      toInternalBalance: false,
    };

    const tokensIn = tokensOut.map(() => tokenIn);

    const method = exactOut
      ? 'swapUnwrapAaveStaticExactOut'
      : 'swapUnwrapAaveStaticExactIn';

    return await this.service.sdk.relayer[method](
      tokensIn,
      tokensOut,
      amountsIn,
      rates,
      funds,
      slippage,
      {
        fetchPools,
        fetchOnChain: false,
      }
    );
  }

  public async execute(
    txInfo: TransactionData,
    userProvider: Web3Provider
  ): Promise<TransactionResponse> {
    const txBuilder = new TransactionBuilder(userProvider.getSigner());
    return await txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: txInfo.function,
      params: [txInfo.params],
    });
  }
}
