import { MetadatasSubgraphService } from '../../metadata-subgraph.service';
import { QueryBuilder, SubgraphMetadata } from '../../types';
import { metadatasQueryBuilder } from './query';

export class MetadatasEntity {
  constructor(
    private readonly service: MetadatasSubgraphService,
    private readonly query: QueryBuilder = metadatasQueryBuilder
  ) {}

  public async get(args = {}, attrs = {}): Promise<SubgraphMetadata[]> {
    const queryName = 'Pools';
    const query = this.query(args, attrs, queryName);
    const data = await this.service.client.get(query);
    return data.pools;
  }
}
