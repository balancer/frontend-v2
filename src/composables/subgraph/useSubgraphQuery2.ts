import { useQuery, UseQueryOptions } from 'vue-query';
import { reactive, Ref } from 'vue';
import axios from 'axios';
import { configService } from '@/services/config/config.service';

export const subgraphs = {
  gauge: configService.network.subgraphs.gauge,
  balancer: configService.network.subgraph
};

export default function useSubgraphQuery2<T>(
  subgraphUrl: string,
  query: Ref<string>,
  key: string[],
  options: UseQueryOptions<T> = {}
) {
  const queryKey = reactive([...key, { query }]);

  async function queryFn() {
    try {
      const {
        data: { data: result }
      } = await axios.post(subgraphUrl, {
        query: query.value
      });
      return result;
    } catch (error) {
      console.error(
        `GraphQL request to (${subgraphUrl}) failed. Payload:`,
        query.value,
        'Error:',
        error
      );
      throw error;
    }
  }

  return useQuery(queryKey, queryFn, options);
}
