import Service from '../../balancer-subgraph.service';
import tokenPricesQueryBuilder from './query';
import { QueryBuilder, SubgraphTokenPrice } from '../../types';

export default class TokenPrices {
  service: Service;
  query: QueryBuilder;

  constructor(service: Service, query: QueryBuilder = tokenPricesQueryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<SubgraphTokenPrice[]> {
    const query = this.query(args, attrs);
    const data = await this.service.client.get(query);

    return data.tokenPrices;
  }
}
