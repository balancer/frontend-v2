import Vault from './contracts/vault';
import {
  WeightedPool__factory,
  StablePool__factory,
  InvestmentPool__factory
} from '@balancer-labs/typechain';
import LinearPoolAbi from '@/lib/abi/LinearPool.json';
import StablePhantomPool from '@/lib/abi/StablePhantomPool.json';
import { Config } from '@/lib/config';
import { JsonRpcProvider } from '@ethersproject/providers';
import ERC20_ABI from '@/lib/abi/ERC20.json';
import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { configService as _configService } from '@/services/config/config.service';

export default class BalancerContractsService {
  vault: Vault;
  config: Config;
  provider: JsonRpcProvider;

  constructor(
    readonly configService = _configService,
    readonly rpcProviderService = _rpcProviderService
  ) {
    this.provider = this.rpcProviderService.jsonProvider;
    this.config = this.configService.network;

    // Init contracts
    this.vault = new Vault(this);
  }

  // Combine all the ABIs and remove duplicates
  public get allPoolABIs() {
    return Object.values(
      Object.fromEntries(
        [
          ...WeightedPool__factory.abi,
          ...StablePool__factory.abi,
          ...InvestmentPool__factory.abi,
          ...StablePhantomPool,
          ...LinearPoolAbi,
          ...ERC20_ABI
        ].map(row => [row.name, row])
      )
    );
  }
}

export const balancerContractsService = new BalancerContractsService();
