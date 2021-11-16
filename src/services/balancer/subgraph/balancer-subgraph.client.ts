import axios from 'axios';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { configService as _configService } from '@/services/config/config.service';

export default class BalancerSubgraphClient {
  url: string;

  constructor(private readonly configService = _configService) {
    this.url = configService.network.subgraph;
  }

  public async get(query) {
    try {
      const {
        data: { data }
      } = await axios.post(this.url, { query: jsonToGraphQLQuery({ query }) });
      return data;
    } catch (error) {
      console.error(error);
    }
  }
}

export const balancerSubgraphClient = new BalancerSubgraphClient();
