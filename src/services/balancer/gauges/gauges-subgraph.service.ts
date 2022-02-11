import { gaugesSubgraphClient } from './gauges-subgraph.client';
import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import Gauges from './entities/gauges';

export default class GaugesSubgraphService {
  gauges: Gauges;

  constructor(
    readonly client = gaugesSubgraphClient,
    readonly rpcProviderService = _rpcProviderService
  ) {
    this.gauges = new Gauges(this);
  }
}

export const gaugesSubgraphService = new GaugesSubgraphService();
