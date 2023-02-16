import { GaugesSubgraphService } from '../../gauges-subgraph.service';
import { QueryBuilder, SubgraphGauge } from '../../types';
import { gaugeQueryBuilder } from './query';

export class GaugesEntity {
  constructor(
    private readonly service: GaugesSubgraphService,
    private readonly query: QueryBuilder = gaugeQueryBuilder
  ) {}

  public async get(args = {}, attrs = {}): Promise<SubgraphGauge[]> {
    const queryName = 'Gauges';
    const query = this.query(args, attrs, queryName);
    const data = await this.service.client.get(query);
    return data.liquidityGauges;
  }
}
