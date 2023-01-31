import { UseQueryOptions } from 'react-query/types';
import { computed, reactive, Ref } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { subgraphRequest } from '@/lib/utils/subgraph';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';

/**
 * TYPES
 */
export type GaugeShare = {
  balance: string;
  gauge: {
    id: string;
    poolId: string;
    totalSupply: string;
  };
};

export type UserGaugeShares = {
  gaugeShares: GaugeShare[];
};

/**
 * useUserGaugeSharesQuery
 *
 * Fetches all gaugeShares for the current user or for a specific pool if
 * poolAddress is provided.
 *
 * @param {Ref<string>} poolAddress - Pool to fetch gaugeShares for.
 * @param {UseQueryOptions} options - useQuery options.
 * @returns {GaugeShare[]} An array of user gauge shares.
 */
export default function useUserGaugeSharesQuery(
  poolAddress?: Ref<string>,
  options: UseQueryOptions<GaugeShare[]> = {}
) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady } = useWeb3();

  /**
   * QUERY KEY
   */
  const queryKey = reactive(QUERY_KEYS.User.Gauges(account, poolAddress));

  /**
   * COMPUTED
   */
  const enabled = computed((): boolean => isWalletReady.value);

  const queryArgs = computed(() => {
    if (poolAddress?.value)
      return {
        where: {
          user: account.value.toLowerCase(),
          balance_gt: '0',
          gauge_: { pool: poolAddress.value.toLowerCase() },
        },
      };

    return { where: { user: account.value.toLowerCase(), balance_gt: '0' } };
  });

  const subgraphQuery = computed(() => ({
    gaugeShares: {
      __args: queryArgs.value,
      balance: true,
      gauge: {
        id: true,
        poolId: true,
        totalSupply: true,
      },
    },
  }));

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    try {
      const { gaugeShares } = await subgraphRequest<UserGaugeShares>({
        url: configService.network.subgraphs.gauge,
        query: subgraphQuery.value,
      });

      return gaugeShares;
    } catch (error) {
      console.error('Failed to fetch pool gauges user', {
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

  return useQuery<GaugeShare[]>(queryKey, queryFn, queryOptions);
}
