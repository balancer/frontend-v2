import { captureException } from '@sentry/browser';
import axios from 'axios';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

import { configService } from '@/services/config/config.service';

export default class BalancerSubgraphClient {
  constructor(
    private readonly url = configService.subgraph,
    private readonly fallbackUrl = configService.subgraphFallback
  ) {}

  public async get(query) {
    try {
      const payload = this.toPayload(query);
      const response = await axios.post(this.url, payload);

      const errorMessage = response.data.errors?.message;
      if (errorMessage) {
        throw new Error(errorMessage);
      }

      return response.data;
    } catch (error) {
      captureException(
        `GraphQL request to [${this.url}] failed with message: ${
          (error as Error).message
        }. Payload:`,
        query
      );
      console.error(error);
      if (this.fallbackUrl) {
        return this.getByFallbackUrl(query);
      }
    }
  }

  public toPayload(query) {
    return { query: jsonToGraphQLQuery({ query }) };
  }

  private async getByFallbackUrl(query) {
    try {
      if (!this.fallbackUrl) {
        return;
      }
      const payload = this.toPayload(query);
      const {
        data: { data }
      } = await axios.post(this.fallbackUrl, payload);
      return data;
    } catch (error) {
      captureException(
        `GraphQL request to [${this.fallbackUrl}] failed with message: ${
          (error as Error).message
        }. Payload:`,
        query
      );
      console.error(error);
    }
  }
}

export const balancerSubgraphClient = new BalancerSubgraphClient();
