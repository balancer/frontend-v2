import { resolveENSAvatar } from '@tomfrench/ens-avatar-resolver';
import { ComputedRef } from 'vue';
import { Contract } from '@ethersproject/contracts';
import { ErrorCode } from '@ethersproject/logger';
import {
  JsonRpcProvider,
  TransactionResponse,
  Web3Provider
} from '@ethersproject/providers';
import { rpcProviderService as _rpcProviderService } from '../rpc-provider/rpc-provider.service';
import { logFailedTx } from '@/lib/utils/logging';
import { gasPriceService } from '@/services/gas-price/gas-price.service';
import ConfigService, { configService } from '@/services/config/config.service';
import { WalletError } from '@/types';

interface Web3Profile {
  ens: string | null;
  avatar: string | null;
}

const RPC_INVALID_PARAMS_ERROR_CODE = -32602;
const EIP1559_UNSUPPORTED_REGEX = /network does not support EIP-1559/i;

export default class Web3Service {
  appProvider: JsonRpcProvider;
  userProvider!: ComputedRef<Web3Provider>;

  constructor(
    private readonly rpcProviderService = _rpcProviderService,
    private readonly config: ConfigService = configService
  ) {
    this.appProvider = this.rpcProviderService.jsonProvider;
  }

  public setUserProvider(provider: ComputedRef<Web3Provider>) {
    this.userProvider = provider;
  }

  async getEnsName(address: string): Promise<string | null> {
    try {
      return await this.appProvider.lookupAddress(address);
    } catch (error) {
      return null;
    }
  }

  async getEnsAvatar(address: string): Promise<string | null> {
    try {
      return await resolveENSAvatar(this.appProvider, address);
    } catch (error) {
      return null;
    }
  }

  async getProfile(address: string): Promise<Web3Profile> {
    return {
      ens: await this.getEnsName(address),
      avatar: await this.getEnsAvatar(address)
    };
  }

  async getUserAddress(): Promise<string> {
    const signer = this.userProvider.value.getSigner();
    const userAddress: string = await signer.getAddress();
    return userAddress;
  }

  public async sendTransaction(
    contractAddress: string,
    abi: any,
    action: string,
    params: any[],
    options: Record<string, any>,
    forceEthereumLegacyTxType = false
  ): Promise<TransactionResponse> {
    const signer = this.userProvider.value.getSigner();
    const contract = new Contract(contractAddress, abi, signer);

    console.log('Contract: ', contractAddress);
    console.log('Action: ', action);
    console.log('Params: ', params);

    try {
      const gasPriceSettings = await gasPriceService.getGasSettingsForContractCall(
        contract,
        action,
        params,
        options,
        forceEthereumLegacyTxType
      );
      options = { ...options, ...gasPriceSettings };

      return await contract[action](...params, options);
    } catch (e) {
      const error = e as WalletError;

      if (
        error.code === RPC_INVALID_PARAMS_ERROR_CODE &&
        EIP1559_UNSUPPORTED_REGEX.test(error.message)
      ) {
        // Sending tx as EIP1559 has failed, retry with legacy tx type
        return this.sendTransaction(
          contractAddress,
          abi,
          action,
          params,
          options,
          true
        );
      } else if (
        error.code === ErrorCode.UNPREDICTABLE_GAS_LIMIT &&
        this.config.env.APP_ENV !== 'development'
      ) {
        const sender = await signer.getAddress();
        logFailedTx(sender, contract, action, params, options);
      }
      return Promise.reject(error);
    }
  }
}

export const web3Service = new Web3Service();
