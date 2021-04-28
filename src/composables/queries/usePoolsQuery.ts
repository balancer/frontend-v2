import { computed, reactive, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';

import { useStore } from 'vuex';
import isEmpty from 'lodash/isEmpty';
import { getAddress } from '@ethersproject/address';

import { getPoolsWithVolume } from '@/utils/balancer/pools';

import useWeb3 from '@/composables/useWeb3';
import QUERY_KEYS from '@/constants/queryKeys';

import { PoolType, PoolToken } from '@/api/subgraph';

type Pool = {
  liquidity: number;
  apy: string | number;
  volume: string;
  id: string;
  poolType: PoolType;
  swapFee: string;
  tokensList: string[];
  tokens: PoolToken[];
};

type PoolsQueryResponse = {
  pools: Pool[];
  tokens: string[];
};

export default function usePoolsQuery(
  selectedTokens: Ref<string[]>,
  options: QueryObserverOptions<PoolsQueryResponse> = {}
) {
  const store = useStore();
  const { appNetwork } = useWeb3();
  const prices = computed(() => store.state.market.prices);

  const shouldLoadPools = computed(() => !isEmpty(prices.value));
  return useQuery<PoolsQueryResponse>(
    reactive(QUERY_KEYS.Pools.Data(selectedTokens, appNetwork.id)),
    async () => {
      const pools = await getPoolsWithVolume({
        chainId: appNetwork.id,
        prices: prices.value,
        tokenIds: selectedTokens.value
      });

      const tokens = pools
        .map(pool => pool.tokens.map(token => getAddress(token.address)))
        .reduce((a, b) => [...a, ...b], []);

      return {
        pools,
        tokens
      };
    },
    reactive({
      enabled: shouldLoadPools,
      onSuccess: async (poolsData: PoolsQueryResponse) => {
        await store.dispatch('registry/injectTokens', poolsData.tokens);
      },
      ...options
    })
  );
}
