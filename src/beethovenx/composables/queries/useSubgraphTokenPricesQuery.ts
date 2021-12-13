import { computed, reactive, Ref } from 'vue';
import { useQuery } from 'vue-query';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { SubgraphTokenPrice } from '@/services/balancer/subgraph/types';
import { QueryObserverOptions } from 'react-query/core';
import useApp from '@/composables/useApp';

const PAGE_SIZE = 1000;

export default function useSubgraphTokenPricesQuery(
  poolId: Ref<string>,
  asset: Ref<string>,
  minTimestamp: Ref<string>,
  options: QueryObserverOptions<SubgraphTokenPrice[]> = {}
) {
  // COMPOSABLES
  const { appLoading } = useApp();

  // DATA
  const queryKey = QUERY_KEYS.TokenPrices.Current(poolId, asset);

  // COMPUTED
  const enabled = computed(() => !appLoading.value);

  // METHODS
  const queryFn = async () => {
    let numPricesFromResponse = 0;
    let tokenPrices: SubgraphTokenPrice[] = [];
    let skip = 0;

    //ugly loop to make sure we get all of the prices
    do {
      const response = await balancerSubgraphService.tokenPrices.get({
        first: PAGE_SIZE,
        skip,
        where: {
          poolId: poolId.value,
          asset: asset.value,
          timestamp_gt: minTimestamp.value
        },
        orderBy: 'timestamp',
        orderDirection: 'asc'
      });

      tokenPrices = [...tokenPrices, ...response];
      numPricesFromResponse = response.length;
      skip += PAGE_SIZE;
    } while (numPricesFromResponse >= PAGE_SIZE);

    return tokenPrices;
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<SubgraphTokenPrice[]>(queryKey, queryFn, queryOptions);
}
