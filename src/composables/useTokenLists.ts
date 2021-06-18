import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useQuery } from 'vue-query';
import { flatten, keyBy, orderBy, uniqBy } from 'lodash';

import { getAddress } from '@ethersproject/address';

import QUERY_KEYS from '@/constants/queryKeys';
import TOKEN_LISTS from '@/constants/tokenlists';

import { getTokensListURL, loadTokenlist } from '@/lib/utils/tokenlists';
import { lsGet, lsSet } from '@/lib/utils';

import useAccountBalances from './useAccountBalances';

type TokenListItem = {
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
};

type TokenList = {
  keywords: string[];
  logoURI: string;
  name: string;
  timestamp: string;
  tokens: TokenListItem[];
  version: {
    major: number;
    minor: number;
    patch: number;
  };
  tokenListsURL: string;
};

const loadAllTokenLists = async () => {
  // since a request to retrieve the list can fail
  // it is best to use allSettled as we still want to
  // retrieve what we can
  return (
    await Promise.allSettled(
      TOKEN_LISTS.Approved.map(async listURI => {
        const tokenList = (await loadTokenlist(listURI)) as Omit<
          TokenList,
          'tokenListsURL'
        >;

        return {
          ...tokenList,
          tokenListsURL: getTokensListURL(listURI)
        };
      })
    )
  )
    .filter(result => result.status === 'fulfilled')
    .map(result => (result as PromiseFulfilledResult<TokenList>).value);
};

type TokenListRequest = {
  query?: string;
  queryAddress?: string;
};

export default function useTokenLists(request?: TokenListRequest) {
  const store = useStore();
  const activeTokenLists = ref<string[]>(
    lsGet('activeTokenLists', ['Balancer'])
  );
  const prices = computed(() => store.state.market.prices);
  const { balances } = useAccountBalances();

  const queryKey = QUERY_KEYS.TokenLists;
  const queryFn = loadAllTokenLists;

  const { data: lists, isLoading } = useQuery<TokenList[]>(queryKey, queryFn, {
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  const listDictionary = computed(() => keyBy(lists.value, 'name'));
  const injectedTokens = computed(() => store.state.registry.injected);

  const tokens = computed(() => {
    const _tokens = uniqBy<TokenListItem>(
      orderBy(
        [
          // get all the tokens from all the active lists
          // get all tokens that are injected
          // get the ETHER token ALWAYS
          ...flatten([
            ...Object.values(injectedTokens.value).map((t: any) => ({ ...t })),
            ...activeTokenLists.value.map(
              name => listDictionary.value[name]?.tokens
            ),
            store.getters['registry/getEther']()
          ])
            // invalid network tokens get filtered out
            .filter(
              token =>
                token?.chainId === Number(process.env.VUE_APP_NETWORK || 1)
            )
            // populate token data into list of tokens
            .map(token => {
              const balance =
                Number(
                  (balances.value || {})[token.address.toLowerCase()]?.balance
                ) || 0;
              const price =
                prices.value[token.address.toLowerCase()]?.price || 0;
              const value = balance * price;
              const price24HChange =
                prices.value[token.address.toLowerCase()]?.price24HChange || 0;
              const value24HChange = (value / 100) * price24HChange;
              return {
                ...token,
                address: getAddress(token.address), // Enforce that we use checksummed addresses
                value,
                price,
                price24HChange,
                balance,
                value24HChange
              };
            })
        ],
        ['value', 'balance'],
        ['desc', 'desc']
      ),
      'address'
    );

    if (request?.queryAddress) {
      const queryAddressLC = request?.queryAddress?.toLowerCase();

      return _tokens.filter(
        token => token.address?.toLowerCase() === queryAddressLC
      );
    }

    // search functionality, this can be better
    if (request?.query) {
      const queryLC = request?.query?.toLowerCase();

      return _tokens.filter(
        token =>
          token.name.toLowerCase().includes(queryLC) ||
          token.symbol.toLowerCase().includes(queryLC)
      );
    }

    return _tokens;
  });

  const tokenDictionary = computed(() => keyBy(tokens.value, 'address'));

  const toggleActiveTokenList = (name: string) => {
    if (activeTokenLists.value.includes(name)) {
      activeTokenLists.value = activeTokenLists.value.filter(
        listName => listName !== name
      );
    } else {
      activeTokenLists.value.push(name);
    }
    lsSet('activeTokenLists', activeTokenLists.value);
  };

  const isActiveList = (name: string) => {
    return activeTokenLists.value.includes(name);
  };

  return {
    isLoading,
    lists,
    toggleActiveTokenList,
    isActiveList,
    tokens,
    listDictionary,
    tokenDictionary,
    activeTokenLists
  };
}
