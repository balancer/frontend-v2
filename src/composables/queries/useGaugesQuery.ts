import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import { gaugesSubgraphService } from '@/services/balancer/gauges/gauges-subgraph.service';
import { SubgraphGauge } from '@/services/balancer/gauges/types';

/**
 * TYPES
 */
type QueryResponse = SubgraphGauge[];

/**
 * @summary Fetches guages list from subgraph
 */
export default function useGaugesQuery(
  options: UseQueryOptions<QueryResponse> = {}
) {
  /**
   * QUERY KEY
   */
  const queryKey = reactive(QUERY_KEYS.Gauges.All());

  /**
   * QUERY FUNCTION
   */
  const queryFn = () => gaugesSubgraphService.gauges.get();

  /**
   * QUERY OPTIONS
   */
  const queryOptions = reactive({
    enabled: true,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
