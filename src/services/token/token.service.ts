import { JsonRpcProvider } from '@ethersproject/providers';

import { configService as _configService } from '../config/config.service';
import { rpcProviderService as _rpcProviderService } from '../rpc-provider/rpc-provider.service';
import AllowancesConcern from './concerns/allowances.concern';
import BalancesConcern from './concerns/balances.concern';
import MetadataConcern from './concerns/metadata.concern';

export default class TokenService {
  provider: JsonRpcProvider;
  metadata: MetadataConcern;
  balances: BalancesConcern;
  allowances: AllowancesConcern;

  constructor(
    readonly metadataConcernClass = MetadataConcern,
    readonly balancesConcernClass = BalancesConcern,
    readonly allowancesConcernClass = AllowancesConcern,
    readonly rpcProviderService = _rpcProviderService,
    readonly configService = _configService
  ) {
    this.provider = this.rpcProviderService.jsonProvider;
    this.metadata = new metadataConcernClass(this);
    this.balances = new balancesConcernClass(this);
    this.allowances = new allowancesConcernClass(this);
  }
}

export const tokenService = new TokenService();
