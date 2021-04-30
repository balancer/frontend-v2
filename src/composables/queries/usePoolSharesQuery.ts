import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';

import { useStore } from 'vuex';
import isEmpty from 'lodash/isEmpty';

import BalancerSubgraph from '@/services/balancer/subgraph/service';

import useWeb3 from '@/composables/useWeb3';
import QUERY_KEYS from '@/constants/queryKeys';
import { PoolShare } from '@/services/balancer/subgraph/types';
import { keyBy } from 'lodash';

type PoolsSharesQueryResponse = {
  poolShares: PoolShare[];
  poolSharesMap: Record<string, PoolShare>;
  poolSharesIds: string[];
};

export default function usePoolSharesQuery(
  options: QueryObserverOptions<PoolsSharesQueryResponse> = {}
) {
  // SERVICES
  const balancerSubgraph = new BalancerSubgraph();

  // COMPOSABLES

  const store = useStore();
  const { account, isConnected } = useWeb3();

  // COMPUTED

  const prices = computed(() => store.state.market.prices);
  const isQueryEnabled = computed(
    () => isConnected.value && account.value != null && !isEmpty(prices.value)
  );

  // DATA
  const queryKey = QUERY_KEYS.Pools.Shares(account);

  // METHODS

  const queryFn = async () => {
    const poolShares = await balancerSubgraph.poolShares.get({
      where: {
        userAddress: account.value.toLowerCase()
      }
    });

    const poolSharesIds = poolShares.map(poolShare => poolShare.poolId.id);
    const poolSharesMap = keyBy(poolShares, poolShare => poolShare.poolId.id);

    return {
      poolShares,
      poolSharesMap,
      poolSharesIds
    };
  };

  const queryOptions = reactive({
    enabled: isQueryEnabled,
    ...options
  });

  return useQuery<PoolsSharesQueryResponse>(
    reactive(queryKey),
    queryFn,
    queryOptions
  );
}
