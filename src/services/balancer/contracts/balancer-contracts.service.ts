import Vault from './contracts/vault';
import { Config } from '@/lib/config';
import { JsonRpcProvider } from '@ethersproject/providers';
import { default as vaultAbi } from '@/lib/abi/Vault.json';
import { default as weightedPoolAbi } from '@/lib/abi/WeightedPool.json';
import { default as stablePoolAbi } from '@/lib/abi/StablePool.json';
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
          ...vaultAbi,
          ...weightedPoolAbi,
          ...stablePoolAbi,
          ...TokenAbi
        ].map(row => [row.name, row])
      )
    );
  }
}

export const balancerContractsService = new BalancerContractsService();
