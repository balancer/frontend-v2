import { reactive, ref, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import TokenService from '@/services/token/token.service';
import useWeb3 from '../useWeb3';
import { BalanceDictionary } from '@/services/token/concerns/balance.concern';

// TYPES
type TokenValueDictionary = { [address: string]: string };
type Response = {
  balances: BalanceDictionary;
  // allowances: TokenValueDictionary;
};

// SERVICES
const tokenService = new TokenService();

export default function useAccountQuery(
  tokens: Ref<string[]> = ref([]),
  options: UseQueryOptions<Response> = {}
) {
  const { account, isConnected } = useWeb3();

  // TODO - key will have to be reactive to the user's network
  const queryKey = reactive(QUERY_KEYS.Account.Balances(account, tokens));

  const queryFn = async () => {
    // TODO: again we will have to pass in the user's network here
    const balances = await tokenService.balance.getMany(
      account.value,
      tokens.value
    );
    return {
      balances
    };
  };

  const queryOptions = reactive({
    enabled: isConnected,
    ...options
  });

  return useQuery<Response>(queryKey, queryFn, queryOptions);
}
