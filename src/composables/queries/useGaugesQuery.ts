import { UseQueryOptions } from 'react-query/types';
import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { gaugesSubgraphService } from '@/services/balancer/gauges/gauges-subgraph.service';
import { SubgraphGauge } from '@/services/balancer/gauges/types';

import { isL2 } from '../useNetwork';

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
  const enabled = computed(() => !isL2.value);

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
    enabled,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
