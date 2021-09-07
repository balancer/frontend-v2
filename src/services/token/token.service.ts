import { Container } from 'typedi';
import { JsonRpcProvider } from '@ethersproject/providers';
import { RpcProviderService } from '../rpc-provider/rpc-provider.service';
import { ConfigService } from '../config/config.service';
import MetadataConcern from './concerns/metadata.concern';
import BalancesConcern from './concerns/balances.concern';
import AllowancesConcern from './concerns/allowances.concern';

export default class TokenService {
  provider: JsonRpcProvider;
  metadata: MetadataConcern;
  balances: BalancesConcern;
  allowances: AllowancesConcern;

  constructor(
    readonly metadataConcernClass = MetadataConcern,
    readonly balancesConcernClass = BalancesConcern,
    readonly allowancesConcernClass = AllowancesConcern,
    readonly rpcProviderService = Container.get(RpcProviderService),
    readonly configService = Container.get(ConfigService)
  ) {
    this.provider = this.rpcProviderService.jsonProvider;
    this.metadata = new metadataConcernClass(this);
    this.balances = new balancesConcernClass(this);
    this.allowances = new allowancesConcernClass(this);
  }
}

export const tokenService = new TokenService();
