import {
  InvestmentPool__factory,
  StablePool__factory,
  WeightedPool__factory,
} from '@balancer-labs/typechain';
import { JsonRpcProvider } from '@ethersproject/providers';

import ERC20_ABI from '@/lib/abi/ERC20.json';
import IERC4626 from '@/lib/abi/IERC4626.json';
import LinearPoolAbi from '@/lib/abi/LinearPool.json';
import StablePhantomPool from '@/lib/abi/StablePhantomPool.json';
import StaticATokenLMAbi from '@/lib/abi/StaticATokenLM.json';
import { balancer } from '@/lib/balancer.sdk';
import { Config } from '@/lib/config';
import { configService as _configService } from '@/services/config/config.service';
import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

import BatchRelayer from './contracts/batch-relayer';
import Vault from './contracts/vault';
import veBAL from './contracts/veBAL';

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
          ...ERC20_ABI,
          ...IERC4626,
        ].map(row => [row.name, row])
      )
    );
  }
}

export const balancerContractsService = new BalancerContractsService();
