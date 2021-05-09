import { computed, reactive, ref } from 'vue';
import { TOKEN_LISTS } from '@/constants/tokenlists';
import { useQuery } from 'vue-query';
import { loadTokenlist } from '@/utils/tokenlists';
import { useStore } from 'vuex';
import { flatten, keyBy, orderBy, uniqBy } from 'lodash';
import useAccountBalances from './useAccountBalances';
import { lsGet, lsSet } from '@/utils';

const loadAllTokenLists = async () => {
  // since a request to retrieve the list can fail
  // it is best to use allSettled as we still want to
  // retrieve what we can
  return (
    await Promise.allSettled(
      TOKEN_LISTS.map(async listName => await loadTokenlist(listName))
    )
  )
    .filter(result => result.status === 'fulfilled')
    .map(result => (result as PromiseFulfilledResult<any>).value);
};

type TokenListRequest = {
  getEther?: boolean;
  query?: string;
  queryAddress?: string;
};

export default function useTokenLists(request: TokenListRequest) {
  const store = useStore();
  const activeTokenLists = ref<string[]>(
    lsGet('activeTokenLists', ['Balancer'])
  );
  const prices = computed(() => store.state.market.prices);
  const { balances } = useAccountBalances();

  const { data: lists, isLoading } = useQuery(
    reactive(['tokenLists']),
    loadAllTokenLists
  );

  const listNameMap = computed(() => keyBy(lists.value, 'name'));
  const injectedTokens = store.getters['registry/getInjected'];

  const tokens = computed(() => {
    const _tokens = uniqBy(
      orderBy(
        [
          // get all the tokens from all the active lists
          ...flatten([
            ...Object.values(injectedTokens).map((t: any) => ({ ...t })),
            ...activeTokenLists.value.map(
              name => listNameMap.value[name].tokens
            )
          ])
            // invalid network tokens get filtered out
            .filter(
              token =>
                token.chainId === Number(process.env.VUE_APP_NETWORK || 1)
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

    if (request.getEther) {
      _tokens.unshift(store.getters['register/getEther']);
    }

    if (request?.queryAddress) {
      return _tokens.filter(
        token =>
          token.address?.toLowerCase() === request?.queryAddress?.toLowerCase()
      );
    }

    // search functionality, this can be better
    if (request.query) {
      return _tokens.filter(token => {
        return (
          token.name.toLowerCase().includes(request.query?.toLowerCase()) ||
          token.symbol.toLowerCase().includes(request.query?.toLowerCase())
        );
      });
    }

    return _tokens;
  });

  const toggleActiveTokenList = (name: string) => {
    // remove from active lists
    if (activeTokenLists.value.includes(name)) {
      activeTokenLists.value = activeTokenLists.value.filter(
        listName => listName !== name
      );
      return;
    }
    activeTokenLists.value = [...activeTokenLists.value, name];
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
    listNameMap,
    activeTokenLists
  };
}
