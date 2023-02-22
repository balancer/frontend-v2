import { computed, reactive, Ref, ref } from 'vue';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { ContractAllowancesMap } from '@/services/token/concerns/allowances.concern';
import { tokenService } from '@/services/token/token.service';
import { TokenInfoMap } from '@/types/TokenList';

import useNetwork from '../useNetwork';
import { Web3PluginResponse } from '@/providers/web3-plugin.provider';

/**
 * TYPES
 */
type QueryResponse = ContractAllowancesMap;
type QueryOptions = UseQueryOptions<QueryResponse>;

/**
 * Fetches all allowances for given tokens for each provided contract address.
 */
export default function getUseBalancesQuery(
  web3PluginResponse: Web3PluginResponse
) {
  return function useAllowancesQuery(
    tokens: Ref<TokenInfoMap> = ref({}),
    contractAddresses: Ref<string[]> = ref([]),
    options: QueryOptions = {}
  ) {
    /**
     * COMPOSABLES
     */
    const { account, isWalletReady } = web3PluginResponse;
    const { networkId } = useNetwork();

    /**
     * COMPUTED
     */
    const enabled = computed(() => isWalletReady.value);
    const tokenAddresses = computed(() => Object.keys(tokens.value));

    /**
     * QUERY INPUTS
     */
    const queryKey = reactive(
      QUERY_KEYS.Account.Allowances(
        networkId,
        account,
        contractAddresses,
        tokenAddresses
      )
    );

    const queryFn = async () => {
      console.log('Fetching', tokenAddresses.value.length, 'allowances');
      const allowances = await tokenService.allowances.get(
        account.value,
        contractAddresses.value,
        tokens.value
      );

      return allowances;
    };

    const queryOptions = reactive({
      enabled,
      ...options,
    });

    return useQuery<QueryResponse>(
      queryKey,
      queryFn,
      queryOptions as QueryOptions
    );
  };
}
