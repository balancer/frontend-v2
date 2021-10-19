import Service from '../../balancer-subgraph.service';
import tradePairSnapshotQueryBuilder from './query';
import { TradePairSnapshot, QueryBuilder } from '../../types';

export default class TradePairSnapshots {
  service: Service;
  query: QueryBuilder;

  constructor(
    service: Service,
    query: QueryBuilder = tradePairSnapshotQueryBuilder
  ) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<TradePairSnapshot[]> {
    const query = this.query(args, attrs);
    const data = await this.service.client.get(query);
    return data.tradePairSnapshots;
  }
}
