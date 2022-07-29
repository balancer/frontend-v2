import { UseQueryOptions } from 'react-query/types';
import { computed, reactive, Ref, ref } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { ContractAllowancesMap } from '@/services/token/concerns/allowances.concern';
import { tokenService } from '@/services/token/token.service';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfoMap } from '@/types/TokenList';

import useNetwork from '../useNetwork';

/**
 * TYPES
 */
type QueryResponse = ContractAllowancesMap;

/**
 * Fetches all allowances for given tokens for each provided contract address.
 */
export default function useAllowancesQuery(
  tokens: Ref<TokenInfoMap> = ref({}),
  contractAddresses: Ref<string[]> = ref([]),
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

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
