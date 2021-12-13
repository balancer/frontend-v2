import { resolveENSAvatar } from '@tomfrench/ens-avatar-resolver';
import { JsonRpcProvider } from '@ethersproject/providers';
import { rpcProviderService as _rpcProviderService } from '../rpc-provider/rpc-provider.service';

interface Web3Profile {
  ens: string | null;
  avatar: string | null;
}

export default class Web3Service {
  provider: JsonRpcProvider;

  constructor(readonly rpcProviderService = _rpcProviderService) {
    this.provider = this.rpcProviderService.jsonProvider;
  }

  async getEnsName(address: string): Promise<string | null> {
    try {
      return await this.provider.lookupAddress(address);
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
}

export const web3Service = new Web3Service();
