import { reactive, ref, Ref, computed } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import { tokenService } from '@/services/token/token.service';
import { ContractAllowancesMap } from '@/services/token/concerns/allowances.concern';
import useWeb3 from '@/services/web3/useWeb3';
import useTokenLists2 from '../useTokenLists2';

// TYPES
type Response = ContractAllowancesMap;

export default function useAccountAllowancesQuery(
  trackedTokenAddresses: Ref<string[]> = ref([]),
  contractAddesses: Ref<string[]> = ref([]),
  options: UseQueryOptions<Response> = {}
) {
  const { account, isWalletReady } = useWeb3();
  const { tokenListsLoaded } = useTokenLists2();
  const enabled = computed(() => isWalletReady.value && tokenListsLoaded.value);

  const queryKey = reactive(
    QUERY_KEYS.Account.Allowances2(
      account,
      contractAddesses,
      trackedTokenAddresses
    )
  );

  const queryFn = async () => {
    console.log('Fetching', trackedTokenAddresses.value.length, 'allownances');
    return await tokenService.allowances.get(
      account.value,
      contractAddesses.value,
      trackedTokenAddresses.value
    );
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<Response>(queryKey, queryFn, queryOptions);
}
