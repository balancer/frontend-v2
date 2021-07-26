import getProvider from '@/lib/utils/provider';
import { useQuery } from 'vue-query';
import { computed, provide, reactive, Ref } from 'vue';
import { getBalances } from '@/lib/utils/balancer/tokens';
import { formatEther, formatUnits } from '@ethersproject/units';
import { getAddress } from '@ethersproject/address';
import QUERY_KEYS from '@/constants/queryKeys';
import { ETHER } from '@/constants/tokenlists';
import useWeb3 from '@/services/web3/useWeb3';
import useTokenStore from '@/composables/useTokensStore';

export const BalancesProviderSymbol = Symbol('BALANCES_PROVIDER');

export type BalancesProviderPayload = {
  balances: Ref<Record<string, { balance: string }>>;
  hasBalance: (address: string) => boolean;
  error: Ref<unknown> | Ref<null>;
  isLoading: Ref<boolean>;
  isIdle: Ref<boolean>;
  isError: Ref<boolean>;
  isFetching: Ref<boolean>;
  refetchBalances: Ref<Function>;
};

// THE CONTENTS OF THIS WILL BE REPLACED/ALTERED WITH THE REGISTRY REFACTOR
export default {
  name: 'BalancesProvider',
  setup(props, { slots }) {
    const { account, userNetworkConfig, isWalletReady } = useWeb3();
    const { allTokens: tokens, isLoading: isLoadingTokens } = useTokenStore();

    const isQueryEnabled = computed(
      () =>
        account.value !== null &&
        Object.keys(tokens).length !== 0 &&
        isWalletReady.value &&
        !isLoadingTokens.value
    );

    const {
      data,
      error,
      isLoading,
      isIdle,
      isError,
      isFetching,
      refetch: refetchBalances
    } = useQuery(
      reactive(QUERY_KEYS.Balances.All(account, userNetworkConfig, tokens)),
      () => {
        return Promise.all([
          getBalances(
            String(userNetworkConfig.value?.chainId),
            getProvider(userNetworkConfig.value?.key),
            account.value,
            Object.values(tokens.value)
              .map(token => token.address)
              .filter(token => token !== ETHER.address)
          ),
          getProvider(userNetworkConfig.value?.key).getBalance(
            account.value.toLowerCase()
          )
        ]);
      },
      reactive({
        enabled: isQueryEnabled,
        keepPreviousData: isWalletReady
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

    provide(BalancesProviderSymbol, {
      balances,
      hasBalance,
      error,
      isLoading,
      isIdle,
      isError,
      isFetching,
      refetchBalances
    });

    return () => slots.default();
  }
};
