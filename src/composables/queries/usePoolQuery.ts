import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import useTokens from '@/composables/useTokens';

import { useStore } from 'vuex';
import { pick } from 'lodash';

import QUERY_KEYS from '@/constants/queryKeys';

import BalancerContracts from '@/services/balancer/contracts/service';
import BalancerSubgraph from '@/services/balancer/subgraph/service';
import { FullPool } from '@/services/balancer/subgraph/types';
import { Token } from '@/types';

export default function usePoolQuery(
  id: string,
  options: QueryObserverOptions<FullPool> = {}
) {
  // COMPOSABLES
  const store = useStore();
  const { allTokens } = useTokens();

  // SERVICES
  const balancerSubgraph = new BalancerSubgraph();
  const balancerContracts = new BalancerContracts();

  // DATA
  const queryKey = QUERY_KEYS.Pools.Current(id);

  // COMPUTED
  const appLoading = computed(() => store.state.app.loading);
  const prices = computed(() => store.state.market.prices);
  const isQueryEnabled = computed(() => !appLoading.value);

  // METHODS
  const queryFn = async () => {
    const [pool] = await balancerSubgraph.pools.getDecorated(
      '24h',
      prices.value,
      { where: { id } }
    );
    const tokens = pick(allTokens.value, pool.tokenAddresses) as Token[];
    const onchainData = await balancerContracts.vault.getPoolData(
      id,
      pool.poolType,
      tokens
    );

    await store.dispatch('registry/injectTokens', [
      ...pool.tokenAddresses,
      pool.address
    ]);

    return { ...pool, onchain: onchainData };
  };

  const queryOptions = reactive({
    enabled: isQueryEnabled,
    ...options
  });

  return useQuery<FullPool>(queryKey, queryFn, queryOptions);
}
