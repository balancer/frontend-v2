import { reactive, computed } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { UseInfiniteQueryOptions } from 'react-query/types';

import QUERY_KEYS from '@/constants/queryKeys';
import { POOLS } from '@/constants/pools';

import BalancerSubgraph from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolActivity } from '@/services/balancer/subgraph/types';
import useWeb3 from '@/services/web3/useWeb3';

type UserPoolActivitiesQueryResponse = {
  poolActivities: PoolActivity[];
  skip?: number;
};

export default function usePoolUserActivitiesQuery(
  id: string,
  options: UseInfiniteQueryOptions<UserPoolActivitiesQueryResponse> = {}
) {
  // SERVICES
  const balancerSubgraph = new BalancerSubgraph();

  // COMPOSABLES
  const { account, isWalletReady } = useWeb3();

  // COMPUTED
  const isQueryEnabled = computed(
    () => isWalletReady.value && account.value != null
  );

  // DATA
  const queryKey = reactive(QUERY_KEYS.Pools.UserActivities(id, account));

  // METHODS
  const queryFn = async ({ pageParam = 0 }) => {
    const poolActivities = await balancerSubgraph.poolActivities.get({
      first: POOLS.Pagination.PerPage,
      skip: pageParam,
      where: {
        pool: id,
        sender: account.value.toLowerCase()
      }
    });

    return {
      poolActivities,
      skip:
        poolActivities.length >= POOLS.Pagination.PerPage
          ? pageParam + POOLS.Pagination.PerPage
          : undefined
    };
  };

  const queryOptions = reactive({
    enabled: isQueryEnabled,
    getNextPageParam: (lastPage: UserPoolActivitiesQueryResponse) =>
      lastPage.skip,
    ...options
  });

  return useInfiniteQuery<UserPoolActivitiesQueryResponse>(
    queryKey,
    queryFn,
    queryOptions
  );
}
