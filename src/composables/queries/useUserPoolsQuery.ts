import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import { useStore } from 'vuex';
import { flatten, isEmpty, keyBy } from 'lodash';
import { getAddress } from '@ethersproject/address';

import { bnum } from '@/lib/utils';

import QUERY_KEYS from '@/constants/queryKeys';

import BalancerSubgraph from '@/services/balancer/subgraph/balancer-subgraph.service';
import { DecoratedPoolWithShares } from '@/services/balancer/subgraph/types';
import useVueWeb3 from '@/services/web3/useVueWeb3';
import useTokens from '../useTokens';
import useTokenLists2 from '../useTokenLists2';
import useTokens2 from '../useTokens2';

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
  const { account, isWalletReady } = useVueWeb3();
  const { injectTokens } = useTokens2();
  const { loadingTokenLists } = useTokenLists2();

  // DATA
  const queryKey = reactive(QUERY_KEYS.Pools.User(account));

  // COMPUTED
  const isQueryEnabled = computed(
    () =>
      isWalletReady.value && account.value != null && !loadingTokenLists.value
  );

  // METHODS
  const queryFn = async () => {
    const poolShares = await balancerSubgraph.poolShares.get({
      where: {
        userAddress: account.value.toLowerCase()
      }
    });

    const poolSharesIds = poolShares.map(poolShare => poolShare.poolId.id);
    const poolSharesMap = keyBy(poolShares, poolShare => poolShare.poolId.id);

    const pools = await balancerSubgraph.pools.getDecorated('24h', {
      where: {
        id_in: poolSharesIds
      }
    });

    const tokens = flatten(pools.map(pool => pool.tokenAddresses));
    injectTokens(tokens);

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
    ...options
  });

  return useQuery<UserPoolsQueryResponse>(queryKey, queryFn, queryOptions);
}
