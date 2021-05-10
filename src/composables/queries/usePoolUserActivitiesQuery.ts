import { reactive, computed } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';

import QUERY_KEYS from '@/constants/queryKeys';

import BalancerSubgraph from '@/services/balancer/subgraph/service';
import { PoolActivity } from '@/services/balancer/subgraph/types';

import useWeb3 from '@/composables/useWeb3';

type PoolActivitiesQueryResponse = PoolActivity[];

export default function usePoolActivitiesQuery(
  id: string,
  options: QueryObserverOptions<PoolActivitiesQueryResponse> = {}
) {
  // SERVICES
  const balancerSubgraph = new BalancerSubgraph();

  // COMPOSABLES

  const { account, isConnected } = useWeb3();
  // COMPUTED

  const isQueryEnabled = computed(
    () => isConnected.value && account.value != null
  );

  // DATA
  const queryKey = reactive(QUERY_KEYS.Pools.UserActivities(id, account));

  // METHODS
  const queryFn = async () => {
    const poolActivities = await balancerSubgraph.poolActivities.get({
      where: {
        pool: id,
        sender: account.value.toLowerCase()
      }
    });

    return poolActivities;
  };

  const queryOptions = reactive({
    enabled: isQueryEnabled,
    ...options
  });

  return useQuery<PoolActivitiesQueryResponse>(queryKey, queryFn, queryOptions);
}
