import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import { orderBy } from 'lodash';

import QUERY_KEYS from '@/constants/queryKeys';

import BalancerSubgraph from '@/services/balancer/subgraph/service';
import { PoolActivity } from '@/services/balancer/subgraph/types';

import { normalizePoolActivity } from './utils';

type PoolActivitiesQueryResponse = PoolActivity[];

export default function usePoolActivitiesQuery(
  id: string,
  options: QueryObserverOptions<PoolActivitiesQueryResponse> = {}
) {
  // SERVICES
  const balancerSubgraph = new BalancerSubgraph();

  // DATA
  const queryKey = QUERY_KEYS.Pools.Activity(id);

  // METHODS
  const queryFn = async () => {
    const poolActivities = await balancerSubgraph.poolActivities.get({
      where: {
        pool: id
      }
    });

    const joins = poolActivities.joins.map(poolActivity =>
      normalizePoolActivity(poolActivity, 'join')
    );
    const exits = poolActivities.exits.map(poolActivity =>
      normalizePoolActivity(poolActivity, 'exit')
    );

    return orderBy([...joins, ...exits], 'timestamp', 'desc');
  };

  const queryOptions = reactive(options);

  return useQuery<PoolActivitiesQueryResponse>(
    reactive(queryKey),
    queryFn,
    queryOptions
  );
}
