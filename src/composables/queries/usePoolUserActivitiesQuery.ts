import { UseInfiniteQueryOptions } from 'react-query/types';
import { computed, reactive } from 'vue';
import { useInfiniteQuery } from 'vue-query';

import { POOLS } from '@/constants/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolActivity } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import useNetwork from '../useNetwork';

type UserPoolActivitiesQueryResponse = {
  poolActivities: PoolActivity[];
  skip?: number;
};

export default function usePoolUserActivitiesQuery(
  id: string,
  options: UseInfiniteQueryOptions<UserPoolActivitiesQueryResponse> = {}
) {
  // COMPOSABLES
  const { account, isWalletReady } = useWeb3();
  const { networkId } = useNetwork();

  // COMPUTED
  const enabled = computed(() => isWalletReady.value && account.value != null);

  // DATA
  const queryKey = reactive(
    QUERY_KEYS.Pools.UserActivities(networkId, id, account)
  );

  // METHODS
  const queryFn = async ({ pageParam = 0 }) => {
    const pagination =
      pageParam === 0
        ? POOLS.Pagination.PerPoolInitial
        : POOLS.Pagination.PerPool;

    const poolActivities = await balancerSubgraphService.poolActivities.get({
      first: pagination,
      skip: pageParam,
      where: {
        pool: id,
        sender: account.value.toLowerCase(),
      },
    });

    return {
      poolActivities,
      skip:
        poolActivities.length >= pagination
          ? pageParam + pagination
          : undefined,
    };
  };

  const queryOptions = reactive({
    enabled,
    getNextPageParam: (lastPage: UserPoolActivitiesQueryResponse) =>
      lastPage.skip,
    ...options,
  });

  return useInfiniteQuery<UserPoolActivitiesQueryResponse>(
    queryKey,
    queryFn,
    queryOptions
  );
}
