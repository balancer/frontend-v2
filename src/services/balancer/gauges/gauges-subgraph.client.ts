import axios from 'axios';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

const BALANCER_GAUGES_SUBGRAPH =
  'https://api.thegraph.com/subgraphs/name/mendesfabio/balancer-gauges';

export class GaugesSubgraphClient {
  constructor(public readonly url: string = BALANCER_GAUGES_SUBGRAPH) {}

  public async get(query) {
    try {
      const payload = this.payloadFor(query);
      const {
        data: { data }
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
