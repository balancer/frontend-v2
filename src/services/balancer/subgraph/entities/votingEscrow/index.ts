import { QueryBuilder } from '@/types/subgraph';

import Service from '../../balancer-subgraph.service';
import poolQueryBuilder from './query';

export interface OmniVotingEscrowLock {
  id: string;
}

export default class OmniVotingEscrowLocks {
  service: Service;
  query: QueryBuilder;

  constructor(service: Service, query: QueryBuilder = poolQueryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<OmniVotingEscrowLock[]> {
    const query = this.query(args, attrs);
    const res = await this.service.client.get(query);
    return res;
  }
}
