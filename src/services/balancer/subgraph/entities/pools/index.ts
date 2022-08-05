import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import { QueryBuilder } from '@/types/subgraph';
import { PoolQuery, PoolsSubgraphRepository } from '@balancer-labs/sdk';

import Service from '../../balancer-subgraph.service';
import queryBuilder from './query';

export default class Pools {
  service: Service;
  query: PoolQuery;

  constructor(service: Service, query: PoolQuery) {
    this.service = service;
    this.query = query;
  }

  public async get(query: PoolQuery): Promise<Pool[]> {
    const mergedQuery = this.query.merge(query);
    const repository = new PoolsSubgraphRepository(configService.network.subgraph);
    const pools = await repository.fetch(mergedQuery);
    return pools as Pool[];
  }
}
