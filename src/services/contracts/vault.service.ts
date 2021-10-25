import { MaxUint256 } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Vault__factory } from '@balancer-labs/typechain';
import { SwapV2 } from '@balancer-labs/sor2';
import { configService } from '@/services/config/config.service';
import {
  FundManagement,
  SingleSwap,
  SwapKind
} from '@balancer-labs/balancer-js';
import { web3Service } from '../web3/web3.service';

export class VaultService {
  abi: any;

  constructor() {
    this.abi = Vault__factory.abi;
  }

  get address() {
    return configService.network.addresses.vault;
  }

  public swap(
    single: SingleSwap,
    funds: FundManagement,
    tokenOutAmount: string,
    options: Record<string, any> = {}
  ): Promise<TransactionResponse> {
    return web3Service.sendTransaction(
      this.address,
      this.abi,
      'swap',
      [single, funds, tokenOutAmount, MaxUint256],
      options
    );
  }

  public batchSwap(
    swapKind: SwapKind,
    swaps: SwapV2[],
    tokenAddresses: string[],
    funds: FundManagement,
    limits: string[],
    options: Record<string, any> = {}
  ): Promise<TransactionResponse> {
    return web3Service.sendTransaction(
      this.address,
      this.abi,
      'batchSwap',
      [swapKind, swaps, tokenAddresses, funds, limits, MaxUint256],
      options
    );
  }
}

export const vaultService = new VaultService();