import { computed, reactive, Ref, ref } from 'vue';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import TokenService from '@/services/token/token.service';

import { TokenInfoMap } from '@/types/TokenList';

import useNetwork from '../useNetwork';
import { Web3PluginResponse } from '@/providers/web3-plugin.provider';

/**
 * TYPES
 */
type QueryResponse = BalanceMap;
type QueryOptions = UseQueryOptions<QueryResponse>;

/**
 * Fetches all balances for provided tokens.
 */
export default function getUseBalancesQuery(
  web3PluginResponse: Web3PluginResponse
) {
  return function useBalancesQuery(
    tokens: Ref<TokenInfoMap> = ref({}),
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
      QUERY_KEYS.Account.Balances(networkId, account, tokenAddresses)
    );

    const queryFn = async () => {
      console.log('Fetching', tokenAddresses.value.length, 'balances');
      return await new TokenService().balances.get(account.value, tokens.value);
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
