import { MetadatasEntity } from './entities/pools';
import { metadatasSubgraphClient } from './metadatas-subgraph.client';

export class MetadatasSubgraphService {
  pools: MetadatasEntity;

  constructor(readonly client = metadatasSubgraphClient) {
    this.pools = new MetadatasEntity(this);
  }
}

export const metadatasSubgraphService = new MetadatasSubgraphService();
