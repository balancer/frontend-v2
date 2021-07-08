import { reactive, ref, Ref, computed } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import { tokenService } from '@/services/token/token.service';
import { BalanceMap } from '@/services/token/concerns/balance.concern';
import useVueWeb3 from '@/services/web3/useVueWeb3';

// TYPES
type Response = BalanceMap;

export default function useAccountBalancesQuery(
  tokens: Ref<string[]> = ref([]),
  options: UseQueryOptions<Response> = {}
) {
  const { account, isWalletReady, userNetworkConfig } = useVueWeb3();

  const userNetworkKey = computed(() => userNetworkConfig.value.key);

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
    enabled: isWalletReady,
    ...options
  });

  return useQuery<Response>(queryKey, queryFn, queryOptions);
}
