import { configService } from '@/services/config/config.service';
import axios from 'axios';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { initial, last } from 'lodash';
import { QueryKey } from 'react-query';
import { computed, reactive } from 'vue';
import { useQuery, UseQueryOptions } from 'vue-query';

type Subgraph = 'balancer' | 'gauge';
type QueryArgs = Record<string, any>;
type SubgraphQuery = {
  __args?: QueryArgs;
  [key: string]: any;
};

type UseSubgraphRequest<T> = {
  subgraph: Subgraph;
  // this needs to be a function as any variables inside the query
  // will need to be re-accessed when requerying
  query: () => SubgraphQuery;
  key: QueryKey;
  options?: UseQueryOptions<T>;
};

const GraphQLEndpoints: Record<Subgraph, string | undefined> = {
  gauge: configService.network.subgraphs.gauge,
  balancer: configService.network.subgraph
};

export default function useSubgraphQuery<T>(request: UseSubgraphRequest<T>) {
  const query = computed(() => {
    return JSON.stringify({
      query: jsonToGraphQLQuery({ query: request.query() })
    });
  });

  async function graphQLRequest() {
    const endpoint = GraphQLEndpoints[request.subgraph];
    if (!endpoint) {
      throw new Error(
        `Could not find a subgraph endpoint in the config for [${request.subgraph}] on [${configService.network.name}]`
      );
    }
    try {
      const {
        data: { data }
      } = await axios.post(endpoint, query.value);

      return data;
    } catch (error) {
      console.error(
        `GraphQL request to [${endpoint}] failed. Payload:`,
        query,
        'Error:',
        error
      );
      throw error;
    }
  }
  return useQuery(
    reactive([
      ...initial(request.key),
      {
        ...(last(request.key) as any),
        query
      }
    ]),
    graphQLRequest,
    request.options
  );
}