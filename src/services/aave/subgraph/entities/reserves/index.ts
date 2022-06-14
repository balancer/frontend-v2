import { ComputedReserveData, v2 } from '@aave/protocol-js';

import { QueryBuilder } from '@/types/subgraph';

import Service from '../../aave-subgraph.service';
import queryBuilder from './query';

export default class Reserves {
  service: Service;
  query: QueryBuilder;

  constructor(service: Service, query: QueryBuilder = queryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<ComputedReserveData[]> {
    const query = this.query(args, attrs);
    const { reserves } = await this.service.client.get(query);

    return v2.formatReserves(reserves);
  }
}
