import { GaugesEntity } from './entities/gauges/gauges.entity';
import { gaugesSubgraphClient } from './gauges-subgraph.client';

export class GaugesSubgraphService {
  gauges: GaugesEntity;

  constructor(readonly client = gaugesSubgraphClient) {
    this.gauges = new GaugesEntity(this);
  }
}

export const gaugesSubgraphService = new GaugesSubgraphService();
