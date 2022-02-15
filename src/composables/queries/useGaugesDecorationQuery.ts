import { computed, reactive, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import { Gauge, SubgraphGauge } from '@/services/balancer/gauges/types';
import { gaugesDecorator } from '@/services/balancer/gauges/gauges.decorator';
import useWeb3 from '@/services/web3/useWeb3';

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

  /**
   * COMPUTED
   */
  const isQueryEnabled = computed(
    () => gauges?.value && gauges.value?.length > 0 && isWalletReady.value
  );

  /**
   * QUERY KEY
   */
  const queryKey = reactive(QUERY_KEYS.Gauges.All.Onchain(gauges));

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    if (!gauges.value) return undefined;
    const decoratedGauges = await gaugesDecorator.decorate(
      gauges.value,
      account.value
    );
    console.log('decoratedGauges', decoratedGauges);
    return decoratedGauges;
  };

  /**
   * QUERY OPTIONS
   */
  const queryOptions = reactive({
    enabled: isQueryEnabled,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
