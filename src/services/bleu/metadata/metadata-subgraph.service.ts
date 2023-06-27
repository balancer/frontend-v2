import { MetadataEntity } from './entities/pools/pools.entity';
import { metadataSubgraphClient } from './metadata-subgraph.client';

export class MetadataSubgraphService {
  pools: MetadataEntity;

  constructor(readonly client = metadataSubgraphClient) {
    this.pools = new MetadataEntity(this);
  }
}

export const metadataSubgraphService = new MetadataSubgraphService();
