import { UseQueryOptions } from 'react-query/types';
import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';

import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';
import useWeb3 from '@/services/web3/useWeb3';

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

  const queryFn = () =>
    balancerContractsService.veBAL.getLockInfo(account.value);

  const queryOptions = reactive({
    enabled,
    ...options,
  });

  return useQuery<QueryResponse>(
    reactive(['tokens', 'veBAL', { networkId, account }]),
    queryFn,
    queryOptions
  );
}
