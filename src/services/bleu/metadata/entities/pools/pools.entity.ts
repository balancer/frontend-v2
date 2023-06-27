import { MetadataSubgraphService } from '../../metadata-subgraph.service';
import { QueryBuilder, SubgraphMetadata } from '../../types';
import { metadataQueryBuilder } from './query';

export class MetadataEntity {
  constructor(
    private readonly service: MetadataSubgraphService,
    private readonly query: QueryBuilder = metadataQueryBuilder
  ) {}

  public async get(args = {}, attrs = {}): Promise<SubgraphMetadata[]> {
    const queryName = 'Pools';
    const query = this.query(args, attrs, queryName);
    const data = await this.service.client.get(query);
    return data.pools;
  }
}
