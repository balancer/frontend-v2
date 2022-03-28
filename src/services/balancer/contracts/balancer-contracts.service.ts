import Vault from './contracts/vault';
import {
  WeightedPool__factory,
  StablePool__factory,
  InvestmentPool__factory
} from '@balancer-labs/typechain';
import LinearPoolAbi from '@/lib/abi/LinearPool.json';
import StaticATokenLMAbi from '@/lib/abi/StaticATokenLM.json';
import StablePhantomPool from '@/lib/abi/StablePhantomPool.json';
import { Config } from '@/lib/config';
import { JsonRpcProvider } from '@ethersproject/providers';
import ERC20_ABI from '@/lib/abi/ERC20.json';
import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { configService as _configService } from '@/services/config/config.service';
import BatchRelayer from './contracts/batch-relayer';
import veBAL from './contracts/veBAL';
import { balancer } from '@/lib/balancer.sdk';

export default class BalancerContractsService {
  vault: Vault;
  batchRelayer: BatchRelayer;
  config: Config;
  provider: JsonRpcProvider;
  veBAL: veBAL;

  constructor(
    readonly configService = _configService,
    readonly rpcProviderService = _rpcProviderService,
    readonly sdk = balancer
  ) {
    this.provider = this.rpcProviderService.jsonProvider;
    this.config = this.configService.network;

    // Init contracts
    this.vault = new Vault(this);
    this.batchRelayer = new BatchRelayer(this);
    this.veBAL = new veBAL(this);
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
          ...StaticATokenLMAbi,
          ...ERC20_ABI
        ].map(row => [row.name, row])
      )
    );
  }
}

export const balancerContractsService = new BalancerContractsService();
