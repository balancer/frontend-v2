import { reactive, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import { SubgraphGauge } from '@/services/balancer/gauges/types';

/**
 * TYPES
 */
type QueryResponse = SubgraphGauge[] | undefined;

/**
 * @summary Fetches onchain data for gauges list.
 */
export default function useGaugesDecorationQuery(
  gauges: Ref<SubgraphGauge[] | undefined>,
  options: UseQueryOptions<QueryResponse> = {}
) {
  /**
   * QUERY KEY
   */
  const queryKey = reactive(QUERY_KEYS.Gauges.All.Onchain(gauges));

  /**
   * QUERY FUNCTION
   */
  const queryFn = () => {
    console.log('Fetch onchain data for', gauges.value);
    return gauges.value;
  };

  /**
   * QUERY OPTIONS
   */
  const queryOptions = reactive({
    enabled: !!gauges.value,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
