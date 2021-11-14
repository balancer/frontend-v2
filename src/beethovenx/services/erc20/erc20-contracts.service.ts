import { Config } from '@/lib/config';
import { default as erc20Abi } from '@/lib/abi/ERC20.json';
import { JsonRpcProvider } from '@ethersproject/providers';
import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { configService as _configService } from '@/services/config/config.service';
import Erc20 from './contracts/erc20';

export default class Erc20ContractService {
  erc20: Erc20;
  config: Config;
  provider: JsonRpcProvider;

  constructor(
    readonly configService = _configService,
    readonly rpcProviderService = _rpcProviderService
  ) {
    this.provider = this.rpcProviderService.jsonProvider;
    this.config = this.configService.network;

    // Init contracts
    this.erc20 = new Erc20(this);
  }

  // Combine all the ABIs and remove duplicates
  public get allABIs() {
    return Object.values(
      Object.fromEntries([...erc20Abi].map(row => [row.name, row]))
    );
  }
}

export const erc20ContractService = new Erc20ContractService();
