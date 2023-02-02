import { QueryBuilder } from '@/types/subgraph';

import Service from '../../balancer-subgraph.service';
import swapPairSnapshotQueryBuilder from './query';

export type SwapPairSnapshot = {
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

export default class SwapPairSnapshots {
  service: Service;
  query: QueryBuilder;

  constructor(
    service: Service,
    query: QueryBuilder = swapPairSnapshotQueryBuilder
  ) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<SwapPairSnapshot[]> {
    const query = this.query(args, attrs);
    const data = await this.service.client.get(query);
    return data.swapPairSnapshots;
  }
}
