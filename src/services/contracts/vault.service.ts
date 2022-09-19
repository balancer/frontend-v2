import {
  FundManagement,
  SingleSwap,
  SwapType,
  SwapV2,
} from '@balancer-labs/sdk';
import { Vault__factory } from '@balancer-labs/typechain';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { MaxUint256 } from '@ethersproject/constants';
import { ContractInterface } from '@ethersproject/contracts';

import ConfigService, { configService } from '@/services/config/config.service';

import Web3Service, { web3Service } from '../web3/web3.service';

export default class VaultService {
  abi: ContractInterface;

  constructor(
    protected readonly config: ConfigService = configService,
    private readonly web3: Web3Service = web3Service
  ) {
    this.abi = Vault__factory.abi;
  }

  get address() {
    return this.config.network.addresses.vault;
  }

  public swap(
    single: SingleSwap,
    funds: FundManagement,
    tokenOutAmount: string,
    options: Record<string, any> = {}
  ): Promise<TransactionResponse> {
    return this.web3.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'swap',
      params: [single, funds, tokenOutAmount, MaxUint256],
      options,
    });
  }

  public batchSwap(
    swapKind: SwapType,
    swaps: SwapV2[],
    tokenAddresses: string[],
    funds: FundManagement,
    limits: string[],
    options: Record<string, any> = {}
  ): Promise<TransactionResponse> {
    return this.web3.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'batchSwap',
      params: [swapKind, swaps, tokenAddresses, funds, limits, MaxUint256],
      options,
    });
  }
}

export const vaultService = new VaultService();
