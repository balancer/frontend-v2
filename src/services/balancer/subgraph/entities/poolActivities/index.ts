import { BalancerSubgraphService } from '../../balancer-subgraph.service';
import queryBuilder from './query';
import { PoolActivity, QueryBuilder } from '../../types';

export default class PoolActivities {
  service: BalancerSubgraphService;
  query: QueryBuilder;

  constructor(
    service: BalancerSubgraphService,
    query: QueryBuilder = queryBuilder
  ) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<PoolActivity[]> {
    const query = this.query(args, attrs);
    const { joinExits } = await this.service.client.get(query);
    return this.serializeActivity(joinExits);
  }

  serializeActivity(poolActivities: PoolActivity[]) {
    return poolActivities.map(poolActivity => ({
      ...poolActivity,
      timestamp: poolActivity.timestamp * 1000
    }));
  }
}
