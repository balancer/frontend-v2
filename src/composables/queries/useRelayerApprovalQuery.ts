import { Vault__factory } from '@balancer-labs/typechain';
import { getEthersContract } from '@/dependencies/EthersContract';
import { computed, reactive, Ref } from 'vue';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';

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
type QueryOptions = UseQueryOptions<QueryResponse>;

export default function useRelayerApprovalQuery(
  relayer: Ref<string>,
  options: QueryOptions = {}
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

  const EthersContract = getEthersContract();
  const vaultContract = computed(
    () =>
      new EthersContract(
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

  return useQuery<QueryResponse>(
    queryKey,
    queryFn,
    queryOptions as QueryOptions
  );
}
