import { UseInfiniteQueryOptions } from 'react-query/types';
import { computed, reactive } from 'vue';
import { useInfiniteQuery } from 'vue-query';

import { POOLS } from '@/constants/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolSwap } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import useNetwork from '../useNetwork';

type PoolSwapsQueryResponse = {
  poolSwaps: PoolSwap[];
  skip?: number;
};

export default function useUserPoolSwapsQuery(
  id: string,
  options: UseInfiniteQueryOptions<PoolSwapsQueryResponse> = {}
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
      first: POOLS.Pagination.PerPage,
      skip: pageParam,
      where: {
        userAddress: account.value.toLowerCase(),
        poolId: id,
      },
    });

    return {
      poolSwaps,
      skip:
        poolSwaps.length >= POOLS.Pagination.PerPage
          ? pageParam + POOLS.Pagination.PerPage
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
    queryOptions
  );
}
