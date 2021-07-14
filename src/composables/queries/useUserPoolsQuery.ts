import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import { useStore } from 'vuex';
import { flatten, isEmpty, keyBy } from 'lodash';
import { getAddress } from '@ethersproject/address';

import { bnum } from '@/lib/utils';

import QUERY_KEYS from '@/constants/queryKeys';

import BalancerSubgraph from '@/services/balancer/subgraph/service';
import { DecoratedPoolWithShares } from '@/services/balancer/subgraph/types';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '../useTokens';

type UserPoolsQueryResponse = {
  pools: DecoratedPoolWithShares[];
  totalInvestedAmount: string;
  tokens: string[];
};

export default function useUserPoolsQuery(
  options: UseQueryOptions<UserPoolsQueryResponse> = {}
) {
  // SERVICES
  const balancerSubgraph = new BalancerSubgraph();

  // COMPOSABLES
  const store = useStore();
  const { account, isWalletReady } = useWeb3();
  const { tokens: allTokens } = useTokens();

  // DATA
  const queryKey = reactive(QUERY_KEYS.Pools.User(account));

  // COMPUTED
  const prices = computed(() => store.state.market.prices);
  const isQueryEnabled = computed(
    () => isWalletReady.value && account.value != null && !isEmpty(prices.value)
  );

  function uninjected(tokens: string[]): string[] {
    const allAddresses = Object.keys(allTokens.value);
    return tokens.filter(address => !allAddresses.includes(address));
  }

  // METHODS
  const queryFn = async () => {
    const poolShares = await balancerSubgraph.poolShares.get({
      where: {
        userAddress: account.value.toLowerCase()
      }
    });

    const poolSharesIds = poolShares.map(poolShare => poolShare.poolId.id);
    const poolSharesMap = keyBy(poolShares, poolShare => poolShare.poolId.id);

    const pools = await balancerSubgraph.pools.getDecorated(
      '24h',
      prices.value,
      {
        where: {
          id_in: poolSharesIds
        }
      }
    );

    const tokens = flatten(pools.map(pool => pool.tokensList.map(getAddress)));
    const uninjectedTokens = uninjected(tokens);
    if (uninjectedTokens.length > 0) {
      await store.dispatch('registry/injectTokens', uninjectedTokens);
    }

    const poolsWithShares = pools.map(pool => ({
      ...pool,
      shares: bnum(pool.totalLiquidity)
        .div(pool.totalShares)
        .times(poolSharesMap[pool.id].balance)
        .toString()
    }));

    const totalInvestedAmount = poolsWithShares
      .map(pool => pool.shares)
      .reduce((totalShares, shares) => totalShares.plus(shares), bnum(0))
      .toString();

    return {
      pools: poolsWithShares,
      tokens,
      totalInvestedAmount
    };
  };

  const queryOptions = reactive({
    enabled: isQueryEnabled,
    onSuccess: async (poolsData: UserPoolsQueryResponse) => {
      await store.dispatch('registry/injectTokens', poolsData.tokens);
    },
    ...options
  });

  return useQuery<UserPoolsQueryResponse>(queryKey, queryFn, queryOptions);
}
