import { BalancerSubgraphService } from '../../balancer-subgraph.service';
import poolQueryBuilder from './query';
import { PoolShare, QueryBuilder } from '../../types';

export default class PoolShares {
  service: BalancerSubgraphService;
  query: QueryBuilder;

  constructor(
    service: BalancerSubgraphService,
    query: QueryBuilder = poolQueryBuilder
  ) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<PoolShare[]> {
    const query = this.query(args, attrs);
    const data = await this.service.client.get(query);
    return data.poolShares;
  }
}
