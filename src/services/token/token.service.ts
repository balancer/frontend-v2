import { JsonRpcProvider } from '@ethersproject/providers';
import { rpcProviderService as _rpcProviderService } from '../rpc-provider/rpc-provider.service';
import { configService as _configService } from '../config/config.service';
import MetadataConcern from './concerns/metadata.concern';
import BalanceConcern from './concerns/balance.concern';

export default class TokenService {
  provider: JsonRpcProvider;
  metadata: MetadataConcern;
  balance: BalanceConcern;

  constructor(
    readonly metadataConcernClass = MetadataConcern,
    readonly balanceConcernClass = BalanceConcern,
    readonly rpcProviderService = _rpcProviderService,
    readonly configService = _configService
  ) {
    this.provider = this.rpcProviderService.jsonProvider;
    this.metadata = new metadataConcernClass(this);
    this.balance = new balanceConcernClass(this);
  }
}
