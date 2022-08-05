import axios from 'axios';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

import { configService as _configService } from '@/services/config/config.service';

export default class AaveSubgraphClient {
  url: string;

  constructor(private readonly configService = _configService) {
    this.url = configService.network.subgraphs.aave;
  }

  public async get(query) {
    try {
      const payload = this.toPayload(query);
      const {
        data: { data },
      } = await axios.post(this.url, payload);
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  public toPayload(query) {
    return JSON.stringify({ query: jsonToGraphQLQuery({ query }) });
  }
}

export const aaveSubgraphClient = new AaveSubgraphClient();
