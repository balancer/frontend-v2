import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import { flatten, keyBy } from 'lodash';
import { bnum } from '@/lib/utils';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { DecoratedPoolWithShares } from '@/services/balancer/subgraph/types';
import useWeb3 from '@/services/web3/useWeb3';
import useTokenLists2 from '../useTokenLists2';
import useTokens2 from '../useTokens2';
import useUserSettings from '../useUserSettings';

type UserPoolsQueryResponse = {
  pools: DecoratedPoolWithShares[];
  totalInvestedAmount: string;
  tokens: string[];
};

export default function useUserPoolsQuery(
  options: UseQueryOptions<UserPoolsQueryResponse> = {}
) {
  /**
   * COMPOSABLES
   */
  const { injectTokens } = useTokens2();
  const { loadingTokenLists } = useTokenLists2();
  const { account, isWalletReady } = useWeb3();
  const { currency } = useUserSettings();

  /**
   * COMPUTED
   */
  const enabled = computed(
    () =>
      isWalletReady.value && account.value != null && !loadingTokenLists.value
  );

  /**
   * QUERY PROPERTIES
   */
  const queryKey = reactive(QUERY_KEYS.Pools.User(account));

  const queryFn = async () => {
    const poolShares = await balancerSubgraphService.poolShares.get({
      where: {
        userAddress: account.value.toLowerCase()
      }
    });

    const poolSharesIds = poolShares.map(poolShare => poolShare.poolId.id);
    const poolSharesMap = keyBy(poolShares, poolShare => poolShare.poolId.id);

    const pools = await balancerSubgraphService.pools.getDecorated(
      '24h',
      currency.value,
      {
        where: {
          id_in: poolSharesIds
        }
      }
    );

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
    enabled,
    ...options
  });

  return useQuery<UserPoolsQueryResponse>(queryKey, queryFn, queryOptions);
}
