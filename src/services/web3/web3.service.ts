import {
  JsonRpcProvider,
  JsonRpcSigner,
  Web3Provider,
} from '@ethersproject/providers';
import { resolveENSAvatar } from '@tomfrench/ens-avatar-resolver';

import ConfigService, { configService } from '@/services/config/config.service';
import {
  rpcProviderService as _rpcProviderService,
  rpcProviderService,
} from '../rpc-provider/rpc-provider.service';
import { TransactionBuilder } from './transactions/transaction.builder';
import { Network } from '@/lib/config';

interface Web3Profile {
  ens: string | null;
  avatar: string | null;
}

export default class Web3Service {
  appProvider: JsonRpcProvider;
  ensProvider: JsonRpcProvider;
  userProvider!: ComputedRef<Web3Provider>;
  // txBuilder!: TransactionBuilder;

  constructor(
    private readonly rpcProviderService = _rpcProviderService,
    private readonly config: ConfigService = configService
  ) {
    this.appProvider = this.rpcProviderService.jsonProvider;
    this.ensProvider = this.rpcProviderService.getJsonProvider(Network.MAINNET);
  }

  public setUserProvider(provider: ComputedRef<Web3Provider>) {
    this.userProvider = provider;
    this.setTxBuilder(provider.value.getSigner());
  }

  public setTxBuilder(signer: JsonRpcSigner) {
    // TODO: We can save the signer, defer the transaction builder instantiation to avoid extra bundle size at bootstrap
    // and then async loading it when used
    // this.txBuilder = new TransactionBuilder(signer); //Adds 1MB to bundle size
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
    return {
      ens: await this.getEnsName(address),
      avatar: await this.getEnsAvatar(address),
    };
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

export const web3Service = new Web3Service();
