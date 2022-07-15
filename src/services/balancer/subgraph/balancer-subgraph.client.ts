import axios from 'axios';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

import { configService as _configService } from '@/services/config/config.service';

export interface SubgraphQueryOptions {
  url?: string
}

export default class BalancerSubgraphClient {
  url: string;

  constructor(private readonly configService = _configService) {
    this.url = configService.network.subgraph;
  }

  public async get(query, options: SubgraphQueryOptions = {}) {
    const url = options.url ? options.url : this.url;
    try {
      const payload = this.toPayload(query);
      const {
        data: { data }
      } = await axios.post(url, payload, {
        headers: {
          'x-api-key': 'da2-7sdh767glzachomgehspnqphey'
        }
      });
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  public toPayload(query) {
    return JSON.stringify({ query: jsonToGraphQLQuery({ query }) });
  }
}

export const balancerSubgraphClient = new BalancerSubgraphClient();
