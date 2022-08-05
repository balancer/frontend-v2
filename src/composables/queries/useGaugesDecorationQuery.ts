import { UseQueryOptions } from 'react-query/types';
import { computed, reactive, Ref } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { gaugesDecorator } from '@/services/balancer/gauges/gauges.decorator';
import { Gauge, SubgraphGauge } from '@/services/balancer/gauges/types';
import useWeb3 from '@/services/web3/useWeb3';

import useNetwork from '../useNetwork';

/**
 * TYPES
 */
type QueryResponse = Gauge[] | undefined;

/**
 * @summary Fetches onchain data for gauges list.
 */
export default function useGaugesDecorationQuery(
  gauges: Ref<SubgraphGauge[] | undefined>,
  options: UseQueryOptions<QueryResponse> = {}
) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady } = useWeb3();
  const { networkId } = useNetwork();

  /**
   * COMPUTED
   */
  const isQueryEnabled = computed(
    () => gauges?.value && gauges.value?.length > 0 && isWalletReady.value
  );

  /**
   * QUERY KEY
   */
  const queryKey = reactive(
    QUERY_KEYS.Gauges.All.Onchain(gauges, account, networkId)
  );

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    if (!gauges.value) return undefined;
    return await gaugesDecorator.decorate(gauges.value, account.value);
  };

  /**
   * QUERY OPTIONS
   */
  const queryOptions = reactive({
    enabled: isQueryEnabled,
    ...options,
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
