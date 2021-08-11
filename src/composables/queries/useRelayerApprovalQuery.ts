import { reactive, computed, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import { Contract } from 'ethers/lib/ethers';

import QUERY_KEYS from '@/constants/queryKeys';
import { FETCH_ONCE_OPTIONS } from '@/constants/vue-query';

import useWeb3 from '@/services/web3/useWeb3';
import { configService } from '@/services/config/config.service';

import vaultAbi from '@/lib/abi/Vault.json';

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
  const { getProvider, account, isWalletReady } = useWeb3();

  /**
   * COMPUTED
   */
  const enabled = computed(() => isWalletReady.value);

  const vaultContract = computed(
    () =>
      new Contract(
        configService.network.addresses.vault,
        vaultAbi,
        getProvider()
      )
  );

  /**
   * QUERY INPUTS
   */
  const queryKey = reactive(
    QUERY_KEYS.Account.RelayerApprovals(account, relayer)
  );

  const queryFn = async (): Promise<boolean> => {
    const approved = await vaultContract.value.hasApprovedRelayer(
      account.value,
      relayer.value
    );

    return approved;
  };

  const queryOptions = reactive({
    enabled,
    ...FETCH_ONCE_OPTIONS,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
