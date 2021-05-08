import Service from '../../service';
import queryBuilder from './query';
import {
  PoolActivities as PoolActivitiesType,
  PoolActivity,
  PoolActivityType,
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
    return this.serialize(data);
  }

  serialize(data: PoolActivitiesType) {
    return {
      joins: data.joins.map(join => this.serializeActivity(join, 'join')),
      exits: data.exits.map(exit => this.serializeActivity(exit, 'exit'))
    };
  }

  serializeActivity(poolActivity: PoolActivity, type: PoolActivityType) {
    return {
      ...poolActivity,
      timestamp: poolActivity.timestamp * 1000,
      type
    };
  }
}
