import { Config } from '@/lib/config';
import { JsonRpcProvider } from '@ethersproject/providers';
import { default as MasterChefAbi } from '@/beethovenx/abi/BeethovenxMasterChef.json';
import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { configService as _configService } from '@/services/config/config.service';
import MasterChef from './contracts/master-chef';
import HndRewarder from '@/beethovenx/services/farm/contracts/hnd-rewarder';
import BeethovenxToken from '@/beethovenx/services/farm/contracts/beethovenx-token';

export default class MasterChefContractsService {
  masterChef: MasterChef;
  hndRewarder: HndRewarder;
  beethovenxToken: BeethovenxToken;
  config: Config;
  provider: JsonRpcProvider;

  constructor(
    readonly configService = _configService,
    readonly rpcProviderService = _rpcProviderService
  ) {
    this.provider = this.rpcProviderService.jsonProvider;
    this.config = this.configService.network;

    // Init contracts
    this.masterChef = new MasterChef(this);
    this.beethovenxToken = new BeethovenxToken(this);
    this.hndRewarder = new HndRewarder(this);
  }

  // Combine all the ABIs and remove duplicates
  public get allABIs() {
    return Object.values(
      Object.fromEntries([...MasterChefAbi].map(row => [row.name, row]))
    );
  }
}

export const masterChefContractsService = new MasterChefContractsService();
