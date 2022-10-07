import axios from 'axios';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { initial, last } from 'lodash';
import { QueryKey } from 'react-query';
import { reactive } from 'vue';
import { useQuery, UseQueryOptions } from 'vue-query';

import { configService } from '@/services/config/config.service';
import { subgraphFallbackService } from '@/services/balancer/subgraph/subgraph-fallback.service';

export const subgraphs = {
  gauge: configService.network.subgraphs.gauge,
};

export default function useGraphQuery<T>(
  subgraphUrl: string,
  key: QueryKey,
  query: () => Record<any, any>,
  options: UseQueryOptions<T> = {},
  shouldUseSubgraphFallbackUrl?: boolean
) {
  const queryKey = reactive([
    // for our query key style, initial are the string
    // fragments of the query key
    ...initial(key),
    // the last one is the list of dependencies for the query
    {
      // extend the dependencies from the query key and add
      // the current query key as a dependency
      ...(last(key) as any),
    },
  ]);

  const queryFn = async () => {
    if (!subgraphUrl) {
      throw new Error(`A graphQL endpoint wasn't supplied for this query`);
    }

    const payload = {
      query: jsonToGraphQLQuery({ query: query() }),
    };

    try {
      if (shouldUseSubgraphFallbackUrl) {
        const response = await subgraphFallbackService.get(payload);
        return response?.data.data;
      }
      const {
        data: { data },
      } = await axios.post(subgraphUrl, {
        query: jsonToGraphQLQuery({ query: query() }),
      });

      return data;
    } catch (error) {
      console.error(
        `GraphQL request to [${subgraphUrl}] failed. Payload:`,
        query,
        'Error:',
        error
      );
      throw error;
    }
  };

  return useQuery(queryKey, queryFn, options);
}
