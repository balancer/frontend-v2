import { computed, reactive, Ref } from 'vue';
import { useQuery } from 'vue-query';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import {
  PoolSwap,
  SubgraphSwap,
  SubgraphTokenPrice
} from '@/services/balancer/subgraph/types';
import { QueryObserverOptions } from 'react-query/core';
import useApp from '@/composables/useApp';

const PAGE_SIZE = 1000;

export default function useAllPoolSwapsQuery(
  poolId: Ref<string>,
  minTimestamp: Ref<number>,
  options: QueryObserverOptions<SubgraphSwap[]> = {}
) {
  const { appLoading } = useApp();
  const queryKey = QUERY_KEYS.Swaps.Pool(poolId);
  const enabled = computed(() => !appLoading.value);

  const queryFn = async () => {
    let numPricesFromResponse = 0;
    let swaps: SubgraphSwap[] = [];
    let skip = 0;

    //ugly loop to make sure we get all of the prices
    do {
      const response = await balancerSubgraphService.swaps.get({
        first: PAGE_SIZE,
        skip,
        where: {
          poolId: poolId.value,
          timestamp_gt: minTimestamp.value
        },
        orderBy: 'timestamp',
        orderDirection: 'asc'
      });

      swaps = [...swaps, ...response];
      numPricesFromResponse = response.length;
      skip += PAGE_SIZE;
    } while (numPricesFromResponse >= PAGE_SIZE);

    return swaps;
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<SubgraphSwap[]>(queryKey, queryFn, queryOptions);
}
