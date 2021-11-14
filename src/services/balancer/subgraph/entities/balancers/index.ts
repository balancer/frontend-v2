import Service from '../../balancer-subgraph.service';
import poolQueryBuilder from './query';
import { QueryBuilder, SubgraphBalancer } from '../../types';

export default class Balancers {
  service: Service;
  query: QueryBuilder;

  constructor(service: Service, query: QueryBuilder = poolQueryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(): Promise<SubgraphBalancer> {
    const query = this.query({ first: 1 }, {});
    const data = await this.service.client.get(query);

    if (data.balancers.length === 0) {
      return {
        totalLiquidity: 0,
        totalSwapFee: 0,
        totalSwapVolume: 0,
        poolCount: 0
      };
    }

    return {
      totalLiquidity: parseFloat(data.balancers[0].totalLiquidity),
      totalSwapVolume: parseFloat(data.balancers[0].totalSwapVolume),
      totalSwapFee: parseFloat(data.balancers[0].totalSwapFee),
      poolCount: parseFloat(data.balancers[0].poolCount)
    };
  }
}
