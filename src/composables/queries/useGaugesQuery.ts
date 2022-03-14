import { reactive, computed } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import { PoolWithGauge } from '@/services/balancer/subgraph/types';
import { gaugesControllerDecorator } from '@/services/balancer/gauges/gauges-controller.decorator';
import useWeb3 from '@/services/web3/useWeb3';
import useNetwork from '../useNetwork';

/**
 * TYPES
 */
type QueryResponse = PoolWithGauge[];

/**
 * @summary Fetches guages list from subgraph
 */
export default function useGaugesQuery(
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
   const enabled = computed(() => isWalletReady.value);
  /**
   * QUERY KEY
   */
  const queryKey = QUERY_KEYS.Gauges.All(networkId, account);

  /**
   * QUERY FUNCTION
   */
  const queryFn = async (): Promise<PoolWithGauge[]> => {
    const rawGauges = require('@/constants/gauges/kovan.json');
    console.log('Got raw gauges', rawGauges);
    const decoratedGauges = await gaugesControllerDecorator.decorate(
      rawGauges,
      account.value
    );
    console.log('Returning decorated gauges: ', decoratedGauges);
    return decoratedGauges;
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
