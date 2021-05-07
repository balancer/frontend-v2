import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import { orderBy } from 'lodash';

import QUERY_KEYS from '@/constants/queryKeys';

import BalancerSubgraph from '@/services/balancer/subgraph/service';
import { PoolActivity } from '@/services/balancer/subgraph/types';

type PoolActivitiesQueryResponse = PoolActivity[];

export default function usePoolActivitiesQuery(
  id: string,
  options: QueryObserverOptions<PoolActivitiesQueryResponse> = {}
) {
  // SERVICES
  const balancerSubgraph = new BalancerSubgraph();

  // DATA
  const queryKey = QUERY_KEYS.Pools.Activities(id);

  // METHODS
  const queryFn = async () => {
    const { joins, exits } = await balancerSubgraph.poolActivities.get({
      where: {
        pool: id
      }
    });

    return orderBy([...joins, ...exits], 'timestamp', 'desc');
  };

  const queryOptions = reactive(options);

  return useQuery<PoolActivitiesQueryResponse>(
    reactive(queryKey),
    queryFn,
    queryOptions
  );
}
