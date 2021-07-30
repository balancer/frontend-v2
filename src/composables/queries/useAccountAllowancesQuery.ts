import { reactive, ref, Ref, computed } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import { tokenService } from '@/services/token/token.service';
import { ContractAllowancesMap } from '@/services/token/concerns/allowances.concern';
import useWeb3 from '@/services/web3/useWeb3';
import useTokenLists2 from '../useTokenLists2';
import { TokenInfoMap } from '@/types/TokenList';

// TYPES
type Response = ContractAllowancesMap;

export default function useAccountAllowancesQuery(
  tokens: Ref<TokenInfoMap> = ref({}),
  contractAddesses: Ref<string[]> = ref([]),
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
    QUERY_KEYS.Account.Allowances2(account, contractAddesses, tokenAddresses)
  );

  const queryFn = async () => {
    console.log('Fetching', tokenAddresses.value.length, 'allownances');
    return await tokenService.allowances.get(
      account.value,
      contractAddesses.value,
      tokens.value
    );
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<Response>(queryKey, queryFn, queryOptions);
}
