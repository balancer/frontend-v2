import { computed, reactive, Ref, ref } from 'vue';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import TokenService from '@/services/token/token.service';

import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfoMap } from '@/types/TokenList';

import useNetwork from '../useNetwork';

/**
 * TYPES
 */
type QueryResponse = BalanceMap;
type QueryOptions = UseQueryOptions<QueryResponse>;
interface QueryInputs {
  tokens: Ref<TokenInfoMap>;
  isEnabled?: Ref<boolean>;
}

/**
 * Fetches all balances for provided tokens.
 */
export default function useBalancesQuery({
  tokens,
  isEnabled = ref(true),
}: QueryInputs) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady } = useWeb3();
  const { networkId } = useNetwork();

  /**
   * COMPUTED
   */
  const enabled = computed(() => isWalletReady.value && isEnabled.value);
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
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  return useQuery<QueryResponse>(
    queryKey,
    queryFn,
    queryOptions as QueryOptions
  );
}
