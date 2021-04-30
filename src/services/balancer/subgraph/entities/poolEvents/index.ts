import Service from '../../service';
import queryBuilder from './query';
import { PoolEvents as PoolEventsType, QueryBuilder } from '../../types';

export default class PoolEvents {
  service: Service;
  query: QueryBuilder;

  constructor(service, query = queryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<PoolEventsType> {
    const query = this.query(args, attrs);
    const data = await this.service.client.get(query);
    return data;
  }
}
