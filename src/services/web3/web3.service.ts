import { resolveENSAvatar } from '@tomfrench/ens-avatar-resolver';
import { Ref, ref } from 'vue';
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

interface Web3Profile {
  ens: string | null;
  avatar: string | null;
}

const RPC_INVALID_PARAMS_ERROR_CODE = -32602;
const EIP1559_UNSUPPORTED_REGEX = /network does not support EIP-1559/i;

export default class Web3Service {
  provider: Ref<Web3Provider | JsonRpcProvider>;

  constructor(
    private readonly rpcProviderService = _rpcProviderService,
    private readonly config: ConfigService = configService
  ) {
    this.provider = ref(this.rpcProviderService.jsonProvider);
  }

  public setProvider(provider: Ref<Web3Provider | JsonRpcProvider>) {
    this.provider = provider;
  }

  async getEnsName(address: string): Promise<string | null> {
    try {
      return await this.provider.value.lookupAddress(address);
    } catch (error) {
      return null;
    }
  }

  async getEnsAvatar(address: string): Promise<string | null> {
    try {
      return await resolveENSAvatar(this.provider, address);
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
    const signer = this.provider.value.getSigner();
    const userAddress: string = await signer.getAddress();
    return userAddress;
  }

  public async sendTransaction(
    contractAddress: string,
    abi: any[],
    action: string,
    params: any[],
    options: Record<string, any>,
    forceEthereumLegacyTxType = false
  ): Promise<TransactionResponse> {
    const signer = this.provider.value.getSigner();
    const contract = new Contract(contractAddress, abi, this.provider.value);
    const contractWithSigner = contract.connect(signer);

    try {
      const gasPriceSettings = await gasPriceService.getGasSettingsForContractCall(
        contractWithSigner,
        action,
        params,
        options,
        forceEthereumLegacyTxType
      );
      options = { ...options, ...gasPriceSettings };

      return await contractWithSigner[action](...params, options);
    } catch (e) {
      if (
        e.code === RPC_INVALID_PARAMS_ERROR_CODE &&
        EIP1559_UNSUPPORTED_REGEX.test(e.message)
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
        e.code === ErrorCode.UNPREDICTABLE_GAS_LIMIT &&
        this.config.env.APP_ENV !== 'development'
      ) {
        const sender = await signer.getAddress();
        logFailedTx(sender, contract, action, params, options);
      }
      return Promise.reject(e);
    }
  }
}

export const web3Service = new Web3Service();
