import { reactive, ref, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import { tokenService } from '@/services/token/token.service';
import { ContractAllowancesMap } from '@/services/token/concerns/allowances.concern';
import useVueWeb3 from '@/services/web3/useVueWeb3';

// TYPES
type Response = ContractAllowancesMap;

export default function useAccountAllowancesQuery(
  tokens: Ref<string[]> = ref([]),
  contractAddesses: Ref<string[]> = ref([]),
  options: UseQueryOptions<Response> = {}
) {
  const { account, isWalletReady } = useVueWeb3();

  const queryKey = reactive(
    QUERY_KEYS.Account.Allowances2(account, contractAddesses, tokens)
  );

  const queryFn = async () => {
    return await tokenService.allowances.get(
      account.value,
      contractAddesses.value,
      tokens.value
    );
  };

  const queryOptions = reactive({
    enabled: isWalletReady,
    ...options
  });

  return useQuery<Response>(queryKey, queryFn, queryOptions);
}
