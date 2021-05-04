import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';

import { useStore } from 'vuex';
import { isEmpty } from 'lodash';

import QUERY_KEYS from '@/constants/queryKeys';

import BalancerSubgraph from '@/services/balancer/subgraph/service';
import { DecoratedPool } from '@/services/balancer/subgraph/types';

export default function usePoolQuery(
  id: string,
  options: QueryObserverOptions<DecoratedPool> = {}
) {
  // SERVICES
  const balancerSubgraph = new BalancerSubgraph();

  // COMPOSABLES
  const store = useStore();

  // DATA
  const queryKey = QUERY_KEYS.Pools.Current(id);

  // COMPUTED
  const prices = computed(() => store.state.market.prices);
  const isQueryEnabled = computed(() => !isEmpty(prices.value));

  // METHODS
  const queryFn = async () => {
    const [pool] = await balancerSubgraph.pools.getDecorated(
      '24h',
      prices.value,
      { where: { id } }
    );
    return pool;
  };

  const queryOptions = reactive({
    enabled: isQueryEnabled,
    ...options
  });

  return useQuery<DecoratedPool>(queryKey, queryFn, queryOptions);
}
