import { reactive } from 'vue';
import { QueryKey } from 'react-query';
import { useQuery, UseQueryOptions } from 'vue-query';
import axios from 'axios';

import { initial, last } from 'lodash';
import { configService } from '@/services/config/config.service';

export const subgraphs = {
  gauge: configService.network.subgraphs.gauge,
  balancer: configService.network.subgraph
};

export default function useGraphQuery<T>(
  graphQLEndpoint: string,
  key: QueryKey,
  query: () => string,
  options: UseQueryOptions<T>
) {
  async function graphQLRequest() {
    if (!graphQLEndpoint) {
      throw new Error(`A graphQL endpoint wasn't supplied for this query`);
    }
    try {
      const {
        data: { data }
      } = await axios.post(graphQLEndpoint, query());

      return data;
    } catch (error) {
      console.error(
        `GraphQL request to [${graphQLEndpoint}] failed. Payload:`,
        query,
        'Error:',
        error
      );
      throw error;
    }
  }
  return useQuery(
    reactive([
      // for our query key style, initial are the string
      // fragments of the query key
      ...initial(key),
      // the last one is the list of dependencies for the query
      {
        // extend the dependencies from the query key and add
        // the current query key as a dependency
        ...(last(key) as any),
        query
      }
    ]),
    graphQLRequest,
    options
  );
}
