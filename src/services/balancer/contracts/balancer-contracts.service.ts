import Vault from './contracts/vault';
import {
  Vault__factory,
  WeightedPool__factory,
  StablePool__factory,
  InvestmentPool__factory
} from '@balancer-labs/typechain';
import { Config } from '@/lib/config';
import { JsonRpcProvider } from '@ethersproject/providers';
import { default as TokenAbi } from '@/lib/abi/ERC20.json';
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
  public get allABIs() {
    return Object.values(
      Object.fromEntries(
        [
          ...Vault__factory.abi,
          ...WeightedPool__factory.abi,
          ...StablePool__factory.abi,
          ...InvestmentPool__factory.abi,
          ...TokenAbi
        ].map(row => [row.name, row])
      )
    );
  }
}

export const balancerContractsService = new BalancerContractsService();
