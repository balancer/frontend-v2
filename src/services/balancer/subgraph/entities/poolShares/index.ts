import Service from '../../service';
import queryBuilder from './query';
import { PoolShare, QueryBuilder } from '../../types';

export default class PoolShares {
  service: Service;
  query: QueryBuilder;

  constructor(service, query = queryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<PoolShare[]> {
    const query = this.query(args, attrs);
    const data = await this.service.client.get(query);
    return data.poolShares;
  }
}
