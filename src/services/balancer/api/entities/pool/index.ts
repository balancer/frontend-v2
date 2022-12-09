import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import { PoolsQueryBuilder } from '@/types/subgraph';
import {
  GraphQLArgs,
  GraphQLQuery,
  PoolsBalancerAPIRepository,
} from '@balancer-labs/sdk';

import Service from '../../balancer-api.service';
import queryBuilder from './query';

export default class SinglePool {
  service: Service;
  queryBuilder: PoolsQueryBuilder;
  lastQuery?: GraphQLQuery;

  constructor(
    service: Service,
    _queryBuilder: PoolsQueryBuilder = queryBuilder
  ) {
    this.service = service;
    this.queryBuilder = _queryBuilder;
  }

  public async get(args: GraphQLArgs = {}, attrs: any = {}): Promise<Pool[]> {
    const query = this.queryBuilder(args, attrs);

    const repository = new PoolsBalancerAPIRepository({
      url: configService.network.balancerApi || '',
      apiKey: configService.network.keys.balancerApi || '',
      query: query,
    });

    const pools = await repository.fetch();

    return pools as Pool[];
  }
}
