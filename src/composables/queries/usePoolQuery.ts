import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import useTokens from '@/composables/useTokens';

import { useStore } from 'vuex';
import { pick } from 'lodash';

import QUERY_KEYS from '@/constants/queryKeys';

import BalancerContracts from '@/services/balancer/contracts/service';
import BalancerSubgraph from '@/services/balancer/subgraph/service';
import { DecoratedPool, FullPool } from '@/services/balancer/subgraph/types';

export default function usePoolQuery(
  id: string,
  options: QueryObserverOptions<FullPool> = {}
) {
  // COMPOSABLES
  const store = useStore();
  const { tokens: allTokens } = useTokens();

  // SERVICES
  const balancerSubgraph = new BalancerSubgraph();
  const balancerContracts = new BalancerContracts();

  // DATA
  const queryKey = QUERY_KEYS.Pools.Current(id);

  // COMPUTED
  const appLoading = computed(() => store.state.app.loading);
  const prices = computed(() => store.state.market.prices);
  const isQueryEnabled = computed(() => !appLoading.value);

  function tokensInjected(pool: DecoratedPool): boolean {
    if (!allTokens.value) return false;

    const allAddresses = Object.keys(allTokens.value);
    return [...pool.tokenAddresses, pool.address].every(address =>
      allAddresses.includes(address)
    );
  }

  // METHODS
  const queryFn = async () => {
    const [pool] = await balancerSubgraph.pools.getDecorated(
      '24h',
      prices.value,
      {
        where: {
          id: id.toLowerCase(),
          totalShares_gt: -1 // Avoid the filtering for low liquidity pools
        }
      }
    );

    if (!tokensInjected(pool)) {
      await store.dispatch('registry/injectTokens', [
        ...pool.tokenAddresses,
        pool.address
      ]);
    }

    const tokens = pick(allTokens.value, pool.tokenAddresses);
    const onchainData = await balancerContracts.vault.getPoolData(
      id,
      pool.poolType,
      tokens
    );

    return { ...pool, onchain: onchainData };
  };

  const queryOptions = reactive({
    enabled: isQueryEnabled,
    ...options
  });

  return useQuery<FullPool>(queryKey, queryFn, queryOptions);
}
