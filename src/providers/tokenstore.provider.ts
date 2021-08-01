import QUERY_KEYS from '@/constants/queryKeys';
import TOKEN_LISTS, { ETHER } from '@/constants/tokenlists';
import { lsGet, lsSet } from '@/lib/utils';
import { getTokensListURL, loadTokenlist } from '@/lib/utils/tokenlists';
import { Token, TokenMap } from '@/types';
import { TokenList } from '@/types/TokenList';
import { flatten, keyBy } from 'lodash';
import { computed, provide, Ref, ref } from 'vue';
import { useQuery } from 'vue-query';
import { useStore } from 'vuex';

export const TokenStoreProviderSymbol = Symbol('TOKENSTORE_PROVIDER');

export type TokenStoreProviderPayload = {
  isLoading: Ref<boolean>;
  lists: Ref<TokenList[]> | Ref<undefined>;
  listMap: Ref<Record<string, TokenList>>;
  activeTokenLists: Ref<string[]>;
  allTokens: Ref<TokenMap>;
  toggleActiveTokenList: (name: string) => void;
  isActiveList: (name: string) => boolean;
  refreshTokenLists: Ref<any>;
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

export default {
  name: 'TokenStoreProvider',
  setup(props, { slots }) {
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

    const getEther = () => {
      const ether: any = ETHER;
      ether.balance = 0;
      ether.balanceDenorm = '0';
      ether.price =
        store.state.market.prices[ether.address.toLowerCase()]?.price || 0;
      ether.price24HChange =
        store.state.market.prices[ether.address.toLowerCase()]
          ?.price24HChange || 0;
      ether.chainId = Number(process.env.VUE_APP_NETWORK || 1);
      return ether;
    };

    const listMap = computed(() => keyBy(lists.value, 'name'));
    const injectedTokens = computed(() => store.state.registry.injected);

    const allTokens = computed(() => {
      // get all the tokens from all the active lists
      // get all tokens that are injected
      // get the ETHER token ALWAYS
      // activeTokenLists;
      return keyBy(
        flatten([
          ...Object.values(injectedTokens.value).map((t: any) => ({ ...t })),
          ...activeTokenLists.value.map(name => listMap.value[name]?.tokens),
          getEther()
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
        activeTokenLists.value = [...activeTokenLists.value, name];
      }
      lsSet('activeTokenLists', activeTokenLists.value);
    };

    const isActiveList = (name: string) => {
      return activeTokenLists.value.includes(name);
    };

    const payload: TokenStoreProviderPayload = {
      isLoading,
      lists,
      allTokens,
      listMap,
      activeTokenLists,
      refreshTokenLists,
      toggleActiveTokenList,
      isActiveList
    };

    provide(TokenStoreProviderSymbol, payload);
    return () => slots.default();
  }
};
