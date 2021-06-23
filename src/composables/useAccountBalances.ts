import getProvider from '@/lib/utils/provider';
import { useQuery } from 'vue-query';
import useTokens from './useTokens';
import useWeb3 from './useWeb3';
import { computed, reactive, watch } from 'vue';
import { getBalances } from '@/lib/utils/balancer/tokens';
import { formatEther, formatUnits } from '@ethersproject/units';
import { getAddress } from '@ethersproject/address';
import { Web3Provider } from '@ethersproject/providers';
import QUERY_KEYS from '@/constants/queryKeys';
import { ETHER } from '@/constants/tokenlists';
import useVueWeb3 from '@/services/web3/useVueWeb3';

export default function useAccountBalances() {
  const { account, userNetworkConfig, isWalletReady } = useVueWeb3();
  const { allTokens: tokens } = useTokens();
  const provider = getProvider(String(userNetworkConfig.value.chainId));
  const isQueryEnabled = computed(
    () =>
      account.value !== null &&
      Object.keys(tokens).length !== 0 &&
      isWalletReady.value
  );

  // TODO separate this out
  const {
    data,
    error,
    isLoading,
    isIdle,
    isError,
    refetch: refetchBalances
  } = useQuery(
    reactive(QUERY_KEYS.Balances.All(account, userNetworkConfig)),
    () => {
      return Promise.all([
        getBalances(
          String(userNetworkConfig.value.chainId),
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
        const balance = formatUnits(
          data.value[0][tokenAddress],
          tokens.value[getAddress(tokenAddress)]?.decimals || 18
        );
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
        balance: formatEther(data.value[1] || 0),
        symbol: ETHER.symbol,
        address: ETHER.address
      };
      return balances;
    }
    return null;
  });

  function hasBalance(address: string): boolean {
    return (balances.value || {})[address];
  }

  return {
    balances,
    hasBalance,
    error,
    isLoading,
    isIdle,
    isError,
    refetchBalances
  };
}
