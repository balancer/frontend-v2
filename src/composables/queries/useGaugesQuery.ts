import { reactive } from 'vue';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { gaugesSubgraphService } from '@/services/balancer/gauges/gauges-subgraph.service';
import { SubgraphGauge } from '@/services/balancer/gauges/types';

/**
 * TYPES
 */
type QueryResponse = SubgraphGauge[];
type QueryOptions = UseQueryOptions<QueryResponse>;

/**
 * @summary Fetches guages list from subgraph
 */
export default function useGaugesQuery(options: QueryOptions = {}) {
  /**
   * QUERY KEY
   */
  const queryKey = reactive(QUERY_KEYS.Gauges.All.Static());

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    try {
      return await gaugesSubgraphService.gauges.get();
    } catch (error) {
      console.error('Failed to fetch gauges', error);
      return [];
    }
  };

  /**
   * QUERY OPTIONS
   */
  const queryOptions = reactive({
    enabled: true,
    ...options,
  });

  return useQuery<QueryResponse>(
    queryKey,
    queryFn,
    queryOptions as QueryOptions
  );
}
