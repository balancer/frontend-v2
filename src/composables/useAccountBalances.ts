import getProvider from '@/utils/provider';
import { useQuery } from 'vue-query';
import useTokens from './useTokens';
import useWeb3 from './useWeb3';
import { computed, reactive } from 'vue';
import { getBalances } from '@/utils/balancer/tokens';
import { formatEther } from '@ethersproject/units';
import { getAddress } from '@ethersproject/address';
import QUERY_KEYS from '@/constants/queryKeys';
import { ETHER } from '@/constants/tokenlists';

export default function useAccountBalances() {
  const { account, userNetwork } = useWeb3();
  const { allTokens: tokens } = useTokens();
  const network = userNetwork.value.key;
  const provider = getProvider(network);
  const isQueryEnabled = computed(
    () => account.value !== null && Object.keys(tokens).length !== 0
  );

  const { data, error, isLoading, isIdle, isError } = useQuery(
    reactive(QUERY_KEYS.Balances.All(account, userNetwork)),
    () => {
      return Promise.all([
        getBalances(
          network,
          provider,
          account.value,
          Object.values(tokens.value).map((token: any) => token.address)
        ),
        provider.getBalance(account.value.toLowerCase())
      ]);
    },
    reactive({
      enabled: isQueryEnabled
    })
  );

  const balances = computed(() => {
    if (data.value) {
      const balances = {};
      Object.keys(data.value[0]).forEach((tokenAddress: string) => {
        const balance = formatEther(data.value[0][tokenAddress]);
        // not concerned with tokens which have a 0 balance
        if (balance === '0.0') return;
        balances[tokenAddress] = {
          balance,
          symbol: tokens.value[getAddress(tokenAddress)].symbol,
          address: getAddress(tokenAddress)
        };
      });

      // separate case for native ether
      balances[ETHER.address.toLowerCase()] = {
        balance: formatEther(data.value[1]),
        symbol: ETHER.symbol,
        address: ETHER.address
      };
      return balances;
    }
    return null;
  });

  return {
    balances,
    error,
    isLoading,
    isIdle,
    isError
  };
}
