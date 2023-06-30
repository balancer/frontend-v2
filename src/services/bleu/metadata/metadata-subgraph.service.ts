import { MetadataEntity } from './entities/pools/pools.entity';
import { metadataSubgraphClient } from './metadata-subgraph.client';

export class MetadataSubgraphService {
  pool: MetadataEntity;

  constructor(readonly client = metadataSubgraphClient) {
    this.pool = new MetadataEntity(this);
  }
}

export const metadataSubgraphService = new MetadataSubgraphService();
