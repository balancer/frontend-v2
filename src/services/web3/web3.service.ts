import { JsonRpcProvider } from '@balancer-labs/sor2/node_modules/@ethersproject/providers';
import { Container } from 'typedi';
import { RpcProviderService } from '../rpc-provider/rpc-provider.service';

interface Web3Profile {
  ens: string | null;
}

export default class Web3Service {
  provider: JsonRpcProvider;

  constructor(readonly rpcProviderService = Container.get(RpcProviderService)) {
    this.provider = this.rpcProviderService.jsonProvider;
  }

  async getEnsName(address: string): Promise<string | null> {
    try {
      return await this.provider.lookupAddress(address);
    } catch (error) {
      return null;
    }
  }

  async getProfile(address: string): Promise<Web3Profile> {
    return {
      ens: await this.getEnsName(address)
    };
  }
}

export const web3Service = new Web3Service();
