import { Ref } from 'vue';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import { GaugeShare } from './useUserGaugeSharesQuery';
import { BigNumber } from '@ethersproject/bignumber';
import { bnSum } from '@/lib/utils';
import { formatUnits } from '@ethersproject/units';
import { logFetchException } from '@/lib/utils/exceptions';
import { getMulticaller } from '@/dependencies/Multicaller';

/**
 * TYPES
 */
type QueryResponse = {
  [poolId: string]: string;
};
type QueryOptions = UseQueryOptions<QueryResponse>;

/**
 * Fetches staked shares for all user positions using onchain calls.
 *
 * We have to do this via the contract because the subgraph is too slow.
 * We want users to receive instant feedback that their staked balances are updated.
 */
export default function useStakedSharesQuery(
  userGaugeShares: Ref<GaugeShare[] | undefined>,
  options: QueryOptions = {}
) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady } = useWeb3();

  /**
   * QUERY KEY
   */
  const queryKey = reactive(
    QUERY_KEYS.User.Pool.StakedShares(userGaugeShares, account)
  );

  /**
   * COMPUTED
   */
  const enabled = computed(
    (): boolean => !!userGaugeShares.value && isWalletReady.value
  );

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    try {
      if (!userGaugeShares.value) return {};

      let result = {} as Record<string, Record<string, BigNumber>>;
      const Multicaller = getMulticaller();
      const multicaller = new Multicaller();

      userGaugeShares.value.forEach(gaugeShare => {
        multicaller.call({
          key: `${gaugeShare.gauge.poolId}.${gaugeShare.gauge.id}`,
          address: gaugeShare.gauge.id,
          function: 'balanceOf',
          abi: ['function balanceOf(address) returns (uint256)'],
          params: [account.value],
        });
      });

      result = await multicaller.execute();
      const shareMap = {} as Record<string, string>;

      for (const poolId in result) {
        const gauges = result[poolId];
        const gaugeShares = Object.values(gauges).map(shares =>
          formatUnits(shares)
        );
        const shareSum = bnSum(gaugeShares).toString();
        shareMap[poolId] = shareSum;
      }

      return shareMap;
    } catch (error) {
      logFetchException('Failed to fetch staked share balance', error);
      throw Error;
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

  return useQuery<QueryResponse>(
    queryKey,
    queryFn,
    queryOptions as QueryOptions
  );
}
