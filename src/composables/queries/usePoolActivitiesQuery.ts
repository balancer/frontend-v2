import { reactive } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { UseInfiniteQueryOptions } from 'react-query/types';

import QUERY_KEYS from '@/constants/queryKeys';
import { POOLS } from '@/constants/pools';

import BalancerSubgraph from '@/services/balancer/subgraph/service';
import { PoolActivity } from '@/services/balancer/subgraph/types';

type PoolActivitiesQueryResponse = {
  poolActivities: PoolActivity[];
  skip?: number;
};

export default function usePoolActivitiesQuery(
  id: string,
  options: UseInfiniteQueryOptions<PoolActivitiesQueryResponse> = {}
) {
  // SERVICES
  const balancerSubgraph = new BalancerSubgraph();

  // DATA
  const queryKey = reactive(QUERY_KEYS.Pools.Activities(id));

  // METHODS
  const queryFn = async ({ pageParam = 0 }) => {
    const poolActivities = await balancerSubgraph.poolActivities.get({
      first: POOLS.Pagination.PerPage,
      skip: pageParam,
      where: {
        pool: id
      }
    });

    return {
      poolActivities,
      skip: poolActivities.length
        ? pageParam + POOLS.Pagination.PerPage
        : undefined
    };
  };

  const queryOptions = reactive({
    getNextPageParam: (lastPage: PoolActivitiesQueryResponse) => lastPage.skip,
    ...options
  });

  return useInfiniteQuery<PoolActivitiesQueryResponse>(
    queryKey,
    queryFn,
    queryOptions
  );
}
