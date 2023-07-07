import { computed, reactive, Ref, ref } from 'vue';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { ContractAllowancesMap } from '@/services/token/concerns/allowances.concern';
import TokenService from '@/services/token/token.service';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfoMap } from '@/types/TokenList';

import useNetwork from '../useNetwork';

/**
 * TYPES
 */
type QueryResponse = ContractAllowancesMap;
type QueryOptions = UseQueryOptions<QueryResponse>;
interface QueryInputs {
  tokens: Ref<TokenInfoMap>;
  contractAddresses: Ref<string[]>;
  isEnabled?: Ref<boolean>;
}

/**
 * Fetches all allowances for given tokens for each provided contract address.
 */
export default function useAllowancesQuery({
  tokens,
  contractAddresses,
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
    QUERY_KEYS.Account.Allowances(
      networkId,
      account,
      contractAddresses,
      tokenAddresses
    )
  );

  const queryFn = async () => {
    console.log('Fetching', tokenAddresses.value.length, 'allowances');
    const allowances = await new TokenService().allowances.get(
      account.value,
      contractAddresses.value,
      tokens.value
    );

    return allowances;
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
