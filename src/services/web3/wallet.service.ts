import { Network } from '@/lib/config/types';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { resolveENSAvatar } from '@tomfrench/ens-avatar-resolver';

import ConfigService, { configService } from '@/services/config/config.service';
import {
  rpcProviderService as _rpcProviderService,
  rpcProviderService,
} from '../rpc-provider/rpc-provider.service';
import { TransactionBuilder } from './transactions/transaction.builder';
import { WalletProvider } from '@/dependencies/wallets/Web3Provider';

interface Web3Profile {
  ens: string | null;
  avatar: string | null;
}

export default class WalletService {
  appProvider: JsonRpcProvider;
  ensProvider: JsonRpcProvider;
  userProvider!: ComputedRef<WalletProvider>;
  txBuilder!: TransactionBuilder;

  constructor(
    private readonly rpcProviderService = _rpcProviderService,
    private readonly config: ConfigService = configService
  ) {
    this.appProvider = this.rpcProviderService.jsonProvider;
    this.ensProvider = this.rpcProviderService.getJsonProvider(Network.MAINNET);
  }

  public setUserProvider(provider: ComputedRef<WalletProvider>) {
    this.userProvider = provider;
    this.setTxBuilder(provider.value.getSigner());
  }

  public setTxBuilder(signer: JsonRpcSigner) {
    this.txBuilder = new TransactionBuilder(signer);
  }

  async getEnsName(address: string): Promise<string | null> {
    try {
      return await this.ensProvider.lookupAddress(address);
    } catch (error) {
      return null;
    }
  }

  async getEnsAvatar(address: string): Promise<string | null> {
    try {
      return await resolveENSAvatar(this.ensProvider, address);
    } catch (error) {
      return null;
    }
  }

  async getProfile(address: string): Promise<Web3Profile> {
    try {
      return {
        ens: await this.getEnsName(address),
        avatar: await this.getEnsAvatar(address),
      };
    } catch (error) {
      console.error('Failed to fetch ENS data', error);
      return {
        ens: null,
        avatar: null,
      };
    }
  }

  async getUserAddress(): Promise<string> {
    const signer = this.userProvider.value.getSigner();
    const userAddress: string = await signer.getAddress();
    return userAddress;
  }

  public async getCurrentBlock(): Promise<number> {
    return await rpcProviderService.getBlockNumber();
  }
}

export const walletService = new WalletService();
