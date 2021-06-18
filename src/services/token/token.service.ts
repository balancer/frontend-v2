import { JsonRpcProvider } from '@ethersproject/providers';
import RpcProviderService from '../rpc-provider/rpc-provider.service';
import ConfigService from '../config/config.service';
import MetadataConcern from './concerns/metadata.concern';
import BalanceConcern from './concerns/balance.concern';

export default class TokenService {
  provider: JsonRpcProvider;
  metadata: MetadataConcern;
  balance: BalanceConcern;

  constructor(
    readonly metadataConcernClass = MetadataConcern,
    readonly balanceConcernClass = BalanceConcern,
    readonly rpcProviderService = new RpcProviderService(),
    readonly configService = new ConfigService()
  ) {
    this.provider = rpcProviderService.jsonProvider;
    this.metadata = new metadataConcernClass(this);
    this.balance = new balanceConcernClass(this);
  }
}
