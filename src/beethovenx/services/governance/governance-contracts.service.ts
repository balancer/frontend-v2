import { Config } from '@/lib/config';
import { JsonRpcProvider } from '@ethersproject/providers';
import { configService as _configService } from '@/services/config/config.service';
import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import FreshBeets from '@/beethovenx/services/governance/contracts/fbeets';
import { default as FreshBeetsAbi } from '@/beethovenx/abi/FreshBeets.json';

export default class GovernanceContractsService {
  config: Config;
  provider: JsonRpcProvider;
  fbeets: FreshBeets;

  constructor(
    readonly configService = _configService,
    readonly rpcProviderService = _rpcProviderService
  ) {
    this.provider = this.rpcProviderService.jsonProvider;
    this.config = this.configService.network;

    // Init contracts
    this.fbeets = new FreshBeets(this);
  }

  // Combine all the ABIs and remove duplicates
  public get allABIs() {
    return Object.values(
      Object.fromEntries([...FreshBeetsAbi].map(row => [row.name, row]))
    );
  }
}

export const governanceContractsService = new GovernanceContractsService();
