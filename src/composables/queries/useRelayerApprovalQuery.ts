import { Vault__factory } from '@balancer-labs/typechain';
import { Contract } from '@ethersproject/contracts';
import { UseQueryOptions } from 'react-query/types';
import { computed, reactive, Ref } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { FETCH_ONCE_OPTIONS } from '@/constants/vue-query';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import useWeb3 from '@/services/web3/useWeb3';

import useNetwork from '../useNetwork';

/**
 * TYPES
 */
type QueryResponse = boolean;

export default function useRelayerApprovalQuery(
  relayer: Ref<string>,
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
  const enabled = computed(() => isWalletReady.value);

  const vaultContract = computed(
    () =>
      new Contract(
        configService.network.addresses.vault,
        Vault__factory.abi,
        rpcProviderService.jsonProvider
      )
  );

  /**
   * QUERY INPUTS
   */
  const queryKey = reactive(
    QUERY_KEYS.Account.RelayerApprovals(networkId, account, relayer)
  );

  const queryFn = async (): Promise<boolean> => {
    if (!relayer.value) {
      return true;
    }

    const approved = await vaultContract.value.hasApprovedRelayer(
      account.value,
      relayer.value
    );

    return approved;
  };

  const queryOptions = reactive({
    enabled,
    ...FETCH_ONCE_OPTIONS,
    ...options,
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
