import axios from 'axios';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import ConfigService from '@/services/config/config.service';

export default class Client {
  url: string;

  constructor(private readonly configService = new ConfigService()) {
    this.url = configService.network.subgraph;
  }

  public async get(query) {
    try {
      const payload = this.toPayload(query);
      const {
        data: { data }
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
