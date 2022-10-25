import { PoolAmpUpdate } from '@/services/pool/types';
import { QueryBuilder } from '@/types/subgraph';

import Service from '../../balancer-subgraph.service';
import queryBuilder from './query';

export default class PoolAmpUpdates {
  service: Service;
  query: QueryBuilder;

  constructor(service: Service, query: QueryBuilder = queryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<PoolAmpUpdate[]> {
    const query = this.query(args, attrs);
    const data = await this.service.client.get(query);

    return data.ampUpdates;
  }
}
