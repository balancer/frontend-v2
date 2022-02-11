import Service from '../../gauges-subgraph.service';
import { gaugeQueryBuilder } from './query';
import { SubgraphGauge, QueryBuilder } from '../../types';

export default class Gauges {
  constructor(
    private readonly service: Service,
    private readonly query: QueryBuilder = gaugeQueryBuilder
  ) {}

  public async get(args = {}, attrs = {}): Promise<SubgraphGauge[]> {
    const query = this.query(args, attrs);
    const data = await this.service.client.get(query);
    return data.liquidityGauges;
  }
}
