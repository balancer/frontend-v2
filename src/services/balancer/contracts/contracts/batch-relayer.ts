import { Contract, Signer } from 'ethers';
import ContractService from '../balancer-contracts.service';
import BatchRelayerAbi from '@/lib/abi/BatchRelayer.json';
import { FundManagement, TransactionData } from '@balancer-labs/sdk';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';

export default class BatchRelayer {
  service: ContractService;
  instance: Contract;

  constructor(service, abi = BatchRelayerAbi) {
    this.service = service;
    this.instance = new Contract(
      this.service.config.addresses.batchRelayer,
      abi,
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
    slippage: string
  ): Promise<TransactionData> {
    const funds: FundManagement = {
      sender: account,
      recipient: this.address, // Note relayer is recipient of swaps
      fromInternalBalance: false,
      toInternalBalance: false
    };

    const tokensIn = tokensOut.map(() => tokenIn);

    return await this.service.sdk.relayer.swapUnwrapAaveStaticExactIn(
      tokensIn,
      tokensOut,
      amountsIn,
      rates,
      funds,
      slippage
    );
  }

  public async stableExit(
    txInfo: TransactionData,
    userSigner: Signer
  ): Promise<TransactionResponse> {
    return await this.instance
      .connect(userSigner)
      [txInfo.function](txInfo.params, { value: '0' });
  }
}
