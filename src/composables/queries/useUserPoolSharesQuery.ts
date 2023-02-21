import { useQuery, UseQueryOptions } from '@tanstack/vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';

/**
 * TYPES
 */
type PoolShareMap = {
  [poolId: string]: string;
};
type QueryOptions = UseQueryOptions<PoolShareMap>;

/**
 * useUserPoolSharesQuery
 *
 * Fetches all poolShares for the current user.
 *
 * @param {UseQueryOptions} options - useQuery options.
 * @returns {PoolShareMap} A map of poolID -> bpt balance.
 */
export default function useUserPoolSharesQuery(options: QueryOptions = {}) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady } = useWeb3();

  /**
   * QUERY KEY
   */
  const queryKey = reactive(QUERY_KEYS.User.Pools(account));

  /**
   * COMPUTED
   */
  const enabled = computed((): boolean => isWalletReady.value);

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    try {
      const poolShares = await balancerSubgraphService.poolShares.get({
        where: {
          userAddress: account.value.toLowerCase(),
        },
      });

      // Create a map from poolShares using poolId as key and balance as value.
      return poolShares.reduce(
        (acc, poolShare) => ({
          ...acc,
          [poolShare.poolId.id]: poolShare.balance,
        }),
        {}
      );
    } catch (error) {
      console.error('Failed users pool shares', {
        cause: error,
      });
      throw error;
    }
  };

  /**
   * QUERY OPTIONS
   */
  const queryOptions = reactive({
    enabled,
    refetchOnWindowFocus: false,
    ...options,
  });

  return useQuery<PoolShareMap>(
    queryKey,
    queryFn,
    queryOptions as QueryOptions
  );
}
