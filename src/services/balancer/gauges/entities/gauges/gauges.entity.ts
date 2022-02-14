import { GaugesSubgraphService } from '../../gauges-subgraph.service';
import { gaugeQueryBuilder } from './query';
import { SubgraphGauge, QueryBuilder } from '../../types';

export class GaugesEntity {
  constructor(
    private readonly service: GaugesSubgraphService,
    private readonly query: QueryBuilder = gaugeQueryBuilder
  ) {}

  public async get(args = {}, attrs = {}): Promise<SubgraphGauge[]> {
    const query = this.query(args, attrs);
    const data = await this.service.client.get(query);
    return data.liquidityGauges;
  }
}
