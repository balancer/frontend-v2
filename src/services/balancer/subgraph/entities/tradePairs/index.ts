import Service from '../../balancer-subgraph.service';
import { QueryBuilder, TradePairSnapshot } from '../../types';
import tradePairSnapshotQueryBuilder from './query';

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
