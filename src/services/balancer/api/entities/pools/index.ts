import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import { PoolsQueryBuilder } from '@/types/subgraph';
import { GraphQLArgs, PoolsBalancerAPIRepository } from '@balancer-labs/sdk';

import Service from '../../balancer-api.service';
import queryBuilder from './query';

export default class Pools {
  service: Service;
  query: PoolsQueryBuilder;
  repository?: PoolsBalancerAPIRepository;

  constructor(service: Service, query: PoolsQueryBuilder = queryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(args: GraphQLArgs = {}, attrs: any = {}): Promise<Pool[]> {
    const query = this.query(args, attrs);
    this.repository = new PoolsBalancerAPIRepository({
      url: configService.network.balancerApi || '',
      apiKey: configService.network.keys.balancerApi || '',
      query: query,
    });
    const pools = await this.repository.fetch({
      first: query.args.first,
      skip: query.args.skip,
    });
    return pools as Pool[];
  }

  get skip(): number {
    return this.repository ? this.repository.skip : 0;
  }
}
