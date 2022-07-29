import { UseInfiniteQueryOptions } from 'react-query/types';
import { reactive } from 'vue';
import { useInfiniteQuery } from 'vue-query';

import { POOLS } from '@/constants/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolSwap } from '@/services/pool/types';

import useNetwork from '../useNetwork';

type PoolSwapsQueryResponse = {
  poolSwaps: PoolSwap[];
  skip?: number;
};

export default function usePoolSwapsQuery(
  id: string,
  subgraphQuery: Record<string, any> = {},
  options: UseInfiniteQueryOptions<PoolSwapsQueryResponse> = {}
) {
  // COMPOSABLES
  const { networkId } = useNetwork();

  // DATA
  const queryKey = reactive(
    QUERY_KEYS.Pools.Swaps(networkId, id, subgraphQuery)
  );

  // METHODS
  const queryFn = async ({ pageParam = 0 }) => {
    const pagination =
      pageParam === 0
        ? POOLS.Pagination.PerPoolInitial
        : POOLS.Pagination.PerPool;

    const poolSwaps = await balancerSubgraphService.poolSwaps.get({
      first: pagination,
      skip: pageParam,
      where: Object.assign(
        {
          poolId: id,
        },
        subgraphQuery
      ),
    });

    return {
      poolSwaps,
      skip: poolSwaps.length >= pagination ? pageParam + pagination : undefined,
    };
  };

  const queryOptions = reactive({
    getNextPageParam: (lastPage: PoolSwapsQueryResponse) => lastPage.skip,
    ...options,
  });

  return useInfiniteQuery<PoolSwapsQueryResponse>(
    queryKey,
    queryFn,
    queryOptions
  );
}
