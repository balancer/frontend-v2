import { reactive } from 'vue';
import { useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/vue-query';

import { POOLS } from '@/constants/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolActivity } from '@/services/pool/types';

import useNetwork from '../useNetwork';

type PoolActivitiesQueryResponse = {
  poolActivities: PoolActivity[];
  skip?: number;
};

type QueryOptions = UseInfiniteQueryOptions<PoolActivitiesQueryResponse>;

export default function usePoolActivitiesQuery(
  id: string,
  options: QueryOptions = {}
) {
  // COMPOSABLES
  const { networkId } = useNetwork();

  // DATA
  const queryKey = reactive(QUERY_KEYS.Pools.Activities(networkId, id));

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
    getNextPageParam: (lastPage: PoolActivitiesQueryResponse) => lastPage.skip,
    ...options,
  });

  return useInfiniteQuery<PoolActivitiesQueryResponse>(
    queryKey,
    queryFn,
    queryOptions as QueryOptions
  );
}
