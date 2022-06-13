import { UseQueryOptions } from 'react-query/types';
import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { feeDistributor } from '@/services/balancer/contracts/contracts/fee-distributor';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import useWeb3 from '@/services/web3/useWeb3';

import { isKovan, isL2, networkId } from '../useNetwork';

/**
 * TYPES
 */
type QueryResponse = BalanceMap;

/**
 * @summary Fetches claimable protocol reward balances.
 */
export default function useProtocolRewardsQuery(
  options: UseQueryOptions<QueryResponse> = {}
) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady } = useWeb3();

  /**
   * COMPUTED
   */
  const enabled = computed(
    () =>
      isWalletReady.value &&
      account.value != null &&
      !isL2.value &&
      !isKovan.value
  );

  /**
   * QUERY KEY
   */
  const queryKey = reactive(QUERY_KEYS.Claims.Protocol(networkId, account));

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    try {
      return await feeDistributor.getClaimableBalances(account.value);
    } catch (error) {
      console.error('Failed to fetch claimable protocol balances', error);
      return {};
    }
  };

  /**
   * QUERY OPTIONS
   */
  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
