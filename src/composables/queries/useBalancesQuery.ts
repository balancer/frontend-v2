import { UseQueryOptions } from 'react-query/types';
import { computed, reactive, Ref, ref } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { tokenService } from '@/services/token/token.service';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfoMap } from '@/types/TokenList';

import useNetwork from '../useNetwork';

/**
 * TYPES
 */
type QueryResponse = BalanceMap;

/**
 * Fetches all balances for provided tokens.
 */
export default function useBalancesQuery(
  tokens: Ref<TokenInfoMap> = ref({}),
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
  const tokenAddresses = computed(() => Object.keys(tokens.value));

  /**
   * QUERY INPUTS
   */
  const queryKey = reactive(
    QUERY_KEYS.Account.Balances(networkId, account, tokenAddresses)
  );

  const queryFn = async () => {
    console.log('Fetching', tokenAddresses.value.length, 'balances');
    return await tokenService.balances.get(account.value, tokens.value);
  };

  const queryOptions = reactive({
    enabled,
    ...options,
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
