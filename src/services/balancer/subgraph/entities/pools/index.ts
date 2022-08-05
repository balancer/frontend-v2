import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import { PoolsQueryBuilder } from '@/types/subgraph';
import { GraphQLArgs, PoolsSubgraphRepository } from '@balancer-labs/sdk';

import Service from '../../balancer-subgraph.service';
import queryBuilder from './query';

export default class Pools {
  service: Service;
  query: PoolsQueryBuilder;

  constructor(service: Service, query: PoolsQueryBuilder = queryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(args: GraphQLArgs = {}, attrs: any = {}): Promise<Pool[]> {
    const query = this.query(args, attrs);
    const repository = new PoolsSubgraphRepository(configService.network.subgraph);
    const pools = await repository.fetch(query);
    return pools as Pool[];
  }
}
