import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useQuery } from 'vue-query';
import { flatten, keyBy } from 'lodash';

import QUERY_KEYS from '@/constants/queryKeys';
import TOKEN_LISTS from '@/constants/tokenlists';

import { getTokensListURL, loadTokenlist } from '@/lib/utils/tokenlists';
import { lsGet, lsSet } from '@/lib/utils';

import { Token } from '@/types';

export type TokenListItem = {
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
  balance: string;
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

// THE CONTENTS OF THIS WILL BE REPLACED/ALTERED WITH THE REGISTRY REFACTOR

// This composable retrieves all the tokens from active token lists,
// all the injected tokens from the store and the ETHER token
// for other composables to build upon
export default function useTokenStore() {
  const store = useStore();
  const activeTokenLists = ref<string[]>(
    lsGet('activeTokenLists', ['Balancer'])
  );
  const queryKey = QUERY_KEYS.TokenLists;
  const queryFn = loadAllTokenLists;

  const { data: lists, isLoading, refetch: refreshTokenLists } = useQuery<
    TokenList[]
  >(queryKey, queryFn, {
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  const listMap = computed(() => keyBy(lists.value, 'name'));
  const injectedTokens = computed(() => store.state.registry.injected);

  const allTokens = computed(() => {
    // get all the tokens from all the active lists
    // get all tokens that are injected
    // get the ETHER token ALWAYS
    return keyBy(
      flatten([
        ...Object.values(injectedTokens.value).map((t: any) => ({ ...t })),
        ...activeTokenLists.value.map(name => listMap.value[name]?.tokens),
        store.getters['registry/getEther']()
      ])
        // invalid network tokens get filtered out
        .filter(
          token => token?.chainId === Number(process.env.VUE_APP_NETWORK || 1)
        ) as Token[],
      'address'
    );
  });

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
    refreshTokenLists,
    allTokens,
    listMap,
    activeTokenLists
  };
}
