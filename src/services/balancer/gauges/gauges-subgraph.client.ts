import { configService } from '@/services/config/config.service';
import { subgraphRequest } from '@/lib/utils/subgraph';
export class GaugesSubgraphClient {
  constructor(
    public readonly url: string = configService.network.subgraphs.gauge
  ) {}

  public async get(query) {
    try {
      return subgraphRequest(this.url, query);
    } catch (error) {
      console.error('GaugesSubgraphClient request failed', error);
      throw error;
    }
  }
}

export const gaugesSubgraphClient = new GaugesSubgraphClient();
