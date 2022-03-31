import { reactive, computed } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';

import QUERY_KEYS from '@/constants/queryKeys';

import useWeb3 from '@/services/web3/useWeb3';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

import useNetwork from '../useNetwork';
import { isVeBalSupported } from '../useVeBAL';

/**
 * TYPES
 */
type QueryResponse = VeBalLockInfo;

export default function useVeBalQuery(
  options: UseQueryOptions<QueryResponse> = {}
) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady } = useWeb3();
  const { networkId } = useNetwork();

  /**
   * COMPUTED
   */
  const enabled = computed(() => isWalletReady.value && isVeBalSupported.value);

  /**
   * QUERY INPUTS
   */
  const queryKey = reactive(QUERY_KEYS.Tokens.VeBAL(networkId, account));

  const queryFn = () =>
    balancerContractsService.veBAL.getLockInfo(account.value);

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
