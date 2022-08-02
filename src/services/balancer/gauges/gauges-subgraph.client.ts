import axios from 'axios';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

import { configService } from '@/services/config/config.service';
export class GaugesSubgraphClient {
  constructor(
    public readonly url: string = configService.network.subgraphs.gauge
  ) {}

  public async get(query) {
    try {
      const payload = this.payloadFor(query);
      const {
        data: { data },
      } = await axios.post(this.url, payload);
      return data;
    } catch (error) {
      console.error('GaugesSubgraphClient request failed', error);
      throw error;
    }
  }

  public payloadFor(query) {
    return JSON.stringify({ query: jsonToGraphQLQuery({ query }) });
  }
}

export const gaugesSubgraphClient = new GaugesSubgraphClient();
