import { MaxUint256 } from '@ethersproject/constants';
import { Vault__factory } from '@balancer-labs/typechain';
import { SwapV2 } from '@balancer-labs/sor2';
import { configService } from '@/services/config/config.service';
import {
  FundManagement,
  SingleSwap,
  SwapKind
} from '@balancer-labs/balancer-js';
import { contractCaller } from './contract-caller.service';

export class VaultService {
  abi: any;

  constructor() {
    this.abi = Vault__factory;
  }

  get address() {
    return configService.network.addresses.vault;
  }

  public async swap(
    single: SingleSwap,
    funds: FundManagement,
    tokenOutAmount: string,
    options: Record<string, any> = {}
  ) {
    return contractCaller.sendTransaction(
      this.address,
      this.abi,
      'swap',
      [single, funds, tokenOutAmount, MaxUint256],
      options
    );
  }

  public async batchSwap(
    swapKind: SwapKind,
    swaps: SwapV2[],
    tokenAddresses: string[],
    funds: FundManagement,
    limits: string[],
    options: Record<string, any> = {}
  ) {
    return contractCaller.sendTransaction(
      this.address,
      this.abi,
      'batchSwap',
      [swapKind, swaps, tokenAddresses, funds, limits, MaxUint256],
      options
    );
  }


}

export const vaultService = new VaultService();