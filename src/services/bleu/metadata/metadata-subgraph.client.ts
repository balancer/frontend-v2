import axios from 'axios';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

import { configService } from '@/services/config/config.service';
export class MetadataSubgraphClient {
  constructor(
    public readonly url: string = configService.network.subgraphs.metadata
  ) {}

  public async get(query) {
    try {
      if (!this.url) {
        return {
          pool: {},
        };
      }
      const payload = this.payloadFor(query);
      const {
        data: { data },
      } = await axios.post(this.url, payload);
      return data;
    } catch (error) {
      console.error('MetadataSubgraphClient request failed', error);
      throw error;
    }
  }

  public payloadFor(query) {
    return { query: jsonToGraphQLQuery({ query }) };
  }
}

export const metadataSubgraphClient = new MetadataSubgraphClient();
