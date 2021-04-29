import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';

import { useStore } from 'vuex';
import isEmpty from 'lodash/isEmpty';
import flatten from 'lodash/flatten';
import { getAddress } from '@ethersproject/address';

import { getPoolsWithShares, PoolWithShares } from '@/utils/balancer/pools';

import useWeb3 from '@/composables/useWeb3';
import QUERY_KEYS from '@/constants/queryKeys';

type PoolsSharesQueryResponse = {
  pools: PoolWithShares[];
  tokens: string[];
  poolIds: string[];
};

export default function usePoolsSharesQuery(
  options: QueryObserverOptions<PoolsSharesQueryResponse> = {}
) {
  const store = useStore();
  const { account, userNetwork, isConnected } = useWeb3();

  const prices = computed(() => store.state.market.prices);
  const networkKey = computed(() => userNetwork.value.key);
  const isQueryEnabled = computed(() => isConnected && !isEmpty(prices.value));

  const queryKey = QUERY_KEYS.Pools.Shares(account);

  const queryFn = async () => {
    const pools = await getPoolsWithShares(
      networkKey.value,
      account.value,
      prices.value
    );

    const tokens = flatten(pools.map(pool => pool.tokensList.map(getAddress)));
    const poolIds = pools.map(pool => pool.id);

    return {
      pools,
      tokens,
      poolIds
    };
  };

  const queryOptions = reactive({
    enabled: isQueryEnabled,
    onSuccess: async (poolsData: PoolsSharesQueryResponse) => {
      await store.dispatch('registry/injectTokens', poolsData.tokens);
    },
    ...options
  });

  return useQuery<PoolsSharesQueryResponse>(queryKey, queryFn, queryOptions);
}
