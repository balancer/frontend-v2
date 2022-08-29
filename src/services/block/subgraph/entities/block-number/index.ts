import { BlockNumberResponse } from '../../../types';

import { QueryBuilder } from '@/types/subgraph';

import Service from '../../block-subgraph.service';
import queryBuilder from './query';

export default class BlockNumber {
  service: Service;
  query: QueryBuilder;

  constructor(service: Service, query: QueryBuilder = queryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<BlockNumberResponse> {
    const query = this.query(args, attrs);
    const response = await this.service.client.get(query);

    return response;
  }
}
