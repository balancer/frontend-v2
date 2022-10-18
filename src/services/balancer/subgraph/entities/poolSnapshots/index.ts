import { toJsTimestamp } from '@/composables/useTime';
import { PoolSnapshot, PoolSnapshots } from '@/services/pool/types';
import { QueryBuilder } from '@/types/subgraph';

import Service from '../../balancer-subgraph.service';
import poolQueryBuilder from './query';

export default class PoolSnapshotsRequest {
  service: Service;
  query: QueryBuilder;

  constructor(service: Service, query: QueryBuilder = poolQueryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<PoolSnapshots> {
    const query = this.query(args, attrs);
    const snapshots = await this.service.client.get(query);
    return this.serialize(snapshots.poolSnapshots);
  }

  private serialize(poolSnapshots: PoolSnapshot[]): PoolSnapshots {
    return poolSnapshots
      .reverse()
      .reduce((acc: Record<string, PoolSnapshot>, snapshot: PoolSnapshot) => {
        const timestamp = toJsTimestamp(snapshot.timestamp);
        acc[timestamp] = {
          ...snapshot,
          timestamp,
        };
        return acc;
      }, {});
  }
}
