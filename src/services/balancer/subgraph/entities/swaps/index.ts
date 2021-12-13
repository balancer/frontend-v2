import Service from '../../balancer-subgraph.service';
import poolQueryBuilder from './query';
import { QueryBuilder, SubgraphSwap } from '../../types';

export default class Swaps {
  service: Service;
  query: QueryBuilder;

  constructor(service: Service, query: QueryBuilder = poolQueryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<SubgraphSwap[]> {
    const query = this.query(args, attrs);
    const data = await this.service.client.get(query);
    return data.swaps;
  }
}
