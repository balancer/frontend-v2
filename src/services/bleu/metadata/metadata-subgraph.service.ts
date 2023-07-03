import { MetadataEntity } from './entities/pool';
import { MetadatasEntity } from './entities/pools';
import { metadataSubgraphClient } from './metadata-subgraph.client';
import { metadatasSubgraphClient } from './metadatas-subgraph.client';

export class MetadataSubgraphService {
  pool: MetadataEntity;

  constructor(readonly client = metadataSubgraphClient) {
    this.pool = new MetadataEntity(this);
  }
}

export class MetadatasSubgraphService {
  pools: MetadatasEntity;

  constructor(readonly client = metadatasSubgraphClient) {
    this.pools = new MetadatasEntity(this);
  }
}

export const metadataSubgraphService = new MetadataSubgraphService();
export const metadatasSubgraphService = new MetadatasSubgraphService();
