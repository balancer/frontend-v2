import { computed, reactive } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { InfiniteData } from 'react-query/core';
import { UseInfiniteQueryOptions } from 'react-query/types';
import { useStore } from 'vuex';
import { flatten, isEmpty, keyBy } from 'lodash';
import { getAddress } from '@ethersproject/address';

import { bnum } from '@/utils';

import useWeb3 from '@/composables/useWeb3';

import QUERY_KEYS from '@/constants/queryKeys';
import { POOLS } from '@/constants/pools';

import BalancerSubgraph from '@/services/balancer/subgraph/service';
import { DecoratedPoolWithShares } from '@/services/balancer/subgraph/types';

type UserPaginatedPoolsQueryResponse = {
  pools: DecoratedPoolWithShares[];
  tokens: string[];
  skip?: number;
};

export default function usePaginatedUserPoolsQuery(
  options: UseInfiniteQueryOptions<UserPaginatedPoolsQueryResponse> = {}
) {
  // SERVICES
  const balancerSubgraph = new BalancerSubgraph();

  // COMPOSABLES
  const store = useStore();
  const { account, isConnected } = useWeb3();

  // DATA
  const queryKey = reactive(QUERY_KEYS.Pools.User(account));

  // COMPUTED
  const prices = computed(() => store.state.market.prices);
  const isQueryEnabled = computed(
    () => isConnected.value && account.value != null && !isEmpty(prices.value)
  );

  // METHODS
  const queryFn = async ({ pageParam = 0 }) => {
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
        first: POOLS.Pagination.PerPage,
        skip: pageParam,
        where: {
          id_in: poolSharesIds
        }
      }
    );

    const tokens = flatten(pools.map(pool => pool.tokensList.map(getAddress)));

    const poolsWithShares = pools.map(pool => ({
      ...pool,
      shares: bnum(pool.totalLiquidity)
        .div(pool.totalShares)
        .times(poolSharesMap[pool.id].balance)
        .toString()
    }));

    return {
      pools: poolsWithShares,
      tokens,
      skip:
        pools.length >= POOLS.Pagination.PerPage
          ? pageParam + POOLS.Pagination.PerPage
          : undefined
    };
  };

  const queryOptions = reactive({
    enabled: isQueryEnabled,
    onSuccess: async (
      poolsData: InfiniteData<UserPaginatedPoolsQueryResponse>
    ) => {
      await store.dispatch(
        'registry/injectTokens',
        poolsData.pages.map(page => page.tokens)
      );
    },
    getNextPageParam: (lastPage: UserPaginatedPoolsQueryResponse) =>
      lastPage.skip,
    ...options
  });

  return useInfiniteQuery<UserPaginatedPoolsQueryResponse>(
    queryKey,
    queryFn,
    queryOptions
  );
}
