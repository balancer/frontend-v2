import { JsonRpcProvider } from '@ethersproject/providers';
import RpcProviderService, {
  rpcProviderService as _rpcProviderService
} from '../rpc-provider/rpc-provider.service';
import ConfigService, {
  configService as _configService
} from '../config/config.service';
import MetadataConcern from './concerns/metadata.concern';
import BalanceConcern from './concerns/balance.concern';
import AllowancesConcern from './concerns/allowances.concern';

export default class TokenService {
  provider: JsonRpcProvider;
  metadata: MetadataConcern;
  balance: BalanceConcern;
  allowances: AllowancesConcern;

  constructor(
    readonly metadataConcernClass = MetadataConcern,
    readonly balanceConcernClass = BalanceConcern,
    readonly allowancesConcernClass = AllowancesConcern,
    readonly rpcProviderService: RpcProviderService = _rpcProviderService,
    readonly configService: ConfigService = _configService
  ) {
    this.provider = rpcProviderService.jsonProvider;
    this.metadata = new metadataConcernClass(this);
    this.balance = new balanceConcernClass(this);
    this.allowances = new allowancesConcernClass(this);
  }
}

export const tokenService = new TokenService();
