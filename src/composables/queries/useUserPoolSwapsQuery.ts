import { computed, reactive } from 'vue';
import { useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/vue-query';

import pools from '@/lib/config/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolSwap } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import useNetwork from '../useNetwork';

type PoolSwapsQueryResponse = {
  poolSwaps: PoolSwap[];
  skip?: number;
};

type QueryOptions = UseInfiniteQueryOptions<PoolSwapsQueryResponse>;

export default function useUserPoolSwapsQuery(
  id: string,
  options: QueryOptions = {}
) {
  // COMPOSABLES
  const { account, isWalletReady } = useWeb3();
  const { networkId } = useNetwork();

  // COMPUTED
  const enabled = computed(() => isWalletReady.value && account.value != null);

  // DATA
  const queryKey = reactive(QUERY_KEYS.Pools.UserSwaps(networkId, id, account));

  // METHODS
  const queryFn = async ({ pageParam = 0 }) => {
    const poolSwaps = await balancerSubgraphService.poolSwaps.get({
      first: pools.Pagination.PerPage,
      skip: pageParam,
      where: {
        userAddress: account.value.toLowerCase(),
        poolId: id,
      },
    });

    return {
      poolSwaps,
      skip:
        poolSwaps.length >= pools.Pagination.PerPage
          ? pageParam + pools.Pagination.PerPage
          : undefined,
    };
  };

  const queryOptions = reactive({
    enabled,
    getNextPageParam: (lastPage: PoolSwapsQueryResponse) => lastPage.skip,
    ...options,
  });

  return useInfiniteQuery<PoolSwapsQueryResponse>(
    queryKey,
    queryFn,
    queryOptions as QueryOptions
  );
}
