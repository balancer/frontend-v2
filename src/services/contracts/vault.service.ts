import { FundManagement, SingleSwap, SwapType, SwapV2 } from '@sobal/sdk';
import { Vault__factory } from '@balancer-labs/typechain';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { ContractInterface } from '@ethersproject/contracts';

import { calculateValidTo } from '../cowswap/utils';

import ConfigService, { configService } from '@/services/config/config.service';

import WalletService, {
  walletService as walletServiceInstance,
} from '@/services/web3/wallet.service';

export default class VaultService {
  abi: ContractInterface;

  constructor(
    protected readonly config: ConfigService = configService,
    private readonly walletService: WalletService = walletServiceInstance
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
    transactionDeadline: number,
    options: Record<string, any> = {}
  ): Promise<TransactionResponse> {
    const deadline = calculateValidTo(transactionDeadline);
    return this.walletService.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'swap',
      params: [single, funds, tokenOutAmount, deadline],
      options,
    });
  }

  public batchSwap(
    swapKind: SwapType,
    swaps: SwapV2[],
    tokenAddresses: string[],
    funds: FundManagement,
    limits: string[],
    transactionDeadline: number,
    options: Record<string, any> = {}
  ): Promise<TransactionResponse> {
    const deadline = calculateValidTo(transactionDeadline);
    return this.walletService.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'batchSwap',
      params: [swapKind, swaps, tokenAddresses, funds, limits, deadline],
      options,
      shouldLogFailure: false,
    });
  }

  public getInternalBalance(
    account: string,
    tokens: string[]
  ): Promise<string[]> {
    return this.walletService.txBuilder.contract.callStatic({
      contractAddress: this.address,
      abi: this.abi,
      action: 'getInternalBalance',
      params: [account, tokens],
    });
  }

  public manageUserBalance({
    kind,
    asset,
    amount,
    sender,
    recipient,
  }: {
    kind: number;
    asset: string;
    amount: string;
    sender: string;
    recipient: string;
  }): Promise<TransactionResponse> {
    return this.walletService.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'manageUserBalance',
      params: [[{ kind, asset, amount, sender, recipient }]],
    });
  }
}

export const vaultService = new VaultService();
