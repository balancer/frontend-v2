import { gaugesSubgraphClient } from './gauges-subgraph.client';
import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { GaugesEntity } from './entities/gauges/gauges.entity';

export class GaugesSubgraphService {
  gauges: GaugesEntity;

  constructor(
    readonly client = gaugesSubgraphClient,
    readonly rpcProviderService = _rpcProviderService
  ) {
    this.gauges = new GaugesEntity(this);
  }
}

export const gaugesSubgraphService = new GaugesSubgraphService();
