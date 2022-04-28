import { TransactionResponse } from '@ethersproject/abstract-provider';
import { UseQueryOptions } from 'react-query/types';
import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { feeDistributor } from '@/services/balancer/contracts/contracts/fee-distributor';
import useWeb3 from '@/services/web3/useWeb3';

import { networkId } from '../useNetwork';

/**
 * TYPES
 */
type QueryResponse = TransactionResponse | never[];

/**
 * @summary Fetches guages list from subgraph
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
  const enabled = computed(() => isWalletReady.value && account.value != null);

  /**
   * QUERY KEY
   */
  const queryKey = reactive(QUERY_KEYS.Claims.Protocol(networkId, account));

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    try {
      const result = await feeDistributor.getClaimableBalances(account.value);
      console.log('result', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch claimable protocol balances', error);
      return [];
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
