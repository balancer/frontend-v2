import { reactive, ref, computed, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import { tokenService } from '@/services/token/token.service';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import useWeb3 from '@/services/web3/useWeb3';
import useTokenLists2 from '../useTokenLists2';
import { TokenInfoMap } from '@/types/TokenList';

// TYPES
type Response = BalanceMap;

export default function useAccountBalancesQuery(
  tokens: Ref<TokenInfoMap> = ref({}),
  options: UseQueryOptions<Response> = {}
) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady } = useWeb3();
  const { tokenListsLoaded } = useTokenLists2();

  /**
   * COMPUTED
   */
  const enabled = computed(() => isWalletReady.value && tokenListsLoaded.value);
  const tokenAddresses = computed(() => Object.keys(tokens.value));

  /**
   * QUERY INPUTS
   */
  const queryKey = reactive(
    QUERY_KEYS.Account.Balances(account, tokenAddresses)
  );

  const queryFn = async () => {
    console.log('Fetching', tokenAddresses.value.length, 'balances');
    return await tokenService.balances.get(account.value, tokens.value);
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<Response>(queryKey, queryFn, queryOptions);
}
