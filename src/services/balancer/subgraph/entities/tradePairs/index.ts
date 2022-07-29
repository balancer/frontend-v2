import { QueryBuilder } from '@/types/subgraph';

import Service from '../../balancer-subgraph.service';
import tradePairSnapshotQueryBuilder from './query';

export type TradePairSnapshot = {
  timestamp: number;
  totalSwapFee: string;
  totalSwapVolume: string;
  pair: {
    token0: {
      symbol: string;
      address: string;
    };
    token1: {
      symbol: string;
      address: string;
    };
  };
};

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
