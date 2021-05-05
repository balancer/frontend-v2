import Service from '../../service';
import queryBuilder from './query';
import {
  PoolActivities as PoolActivitiesType,
  QueryBuilder
} from '../../types';

export default class PoolActivities {
  service: Service;
  query: QueryBuilder;

  constructor(service: Service, query: QueryBuilder = queryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<PoolActivitiesType> {
    const query = this.query(args, attrs);
    const data = await this.service.client.get(query);
    return data;
  }
}
