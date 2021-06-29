import { reactive, ref, Ref, computed } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import TokenService from '@/services/token/token.service';
import useWeb3 from '../useWeb3';
import { BalanceDictionary } from '@/services/token/concerns/balance.concern';

// TYPES
type Response = BalanceDictionary;

// SERVICES
const tokenService = new TokenService();

export default function useAccountBalancesQuery(
  tokens: Ref<string[]> = ref([]),
  options: UseQueryOptions<Response> = {}
) {
  const { account, isConnected, userNetwork } = useWeb3();

  const userNetworkKey = computed(() => userNetwork.value.key);

  const queryKey = reactive(
    QUERY_KEYS.Account.Balances(account, userNetworkKey, tokens)
  );

  const queryFn = async () => {
    return await tokenService.balance.getMany(
      account.value,
      userNetworkKey.value,
      tokens.value
    );
  };

  const queryOptions = reactive({
    enabled: isConnected,
    ...options
  });

  return useQuery<Response>(queryKey, queryFn, queryOptions);
}
