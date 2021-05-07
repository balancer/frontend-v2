import { computed, reactive, ref, watch } from 'vue';
import { TOKEN_LISTS } from '@/constants/tokenlists';
import { useQuery } from 'vue-query';
import { loadTokenlist } from '@/utils/tokenlists';
import { useStore } from 'vuex';
import { flatten, keyBy, orderBy } from 'lodash';
import useAccountBalances from './useAccountBalances';
import { formatUnits } from '@ethersproject/units';

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
  addresses?: string[];
};

export default function useTokenLists(request: TokenListRequest) {
  const store = useStore();
  const activeTokenLists = ref<string[]>(['Balancer']);
  const prices = computed(() => store.state.market.prices);
  const { balances } = useAccountBalances();

  const { data: lists, isLoading } = useQuery(
    reactive(['tokenLists']),
    loadAllTokenLists
  );

  const listNameMap = computed(() => keyBy(lists.value, 'name'));
  const injectedTokens = store.getters['registry/getInjected'];
  const tokens = computed(() => {
    const _tokens = orderBy(
      [
        // insert inject tokens
        ...Object.values(injectedTokens),
        // get all the tokens from all the active lists
        ...flatten(
          activeTokenLists.value.map(name => listNameMap.value[name].tokens)
        )
          // invalid network tokens get filtered out
          .filter(
            token => token.chainId === Number(process.env.VUE_APP_NETWORK || 1)
          )
          // populate token data into list of tokens
          .map(token => {
            // const address = token.address.toLowerCase();
            // const balanceDenorm = balances[address] || '0';
            // const balance = formatUnits(token.balanceDenorm, token.decimals);
            // const price = prices[address]?.price || 0;
            // const value = token.balance * token.price;
            // const price24HChange = prices[address]?.price24HChange || 0;
            // const value24HChange =
            //   (parseFloat(token.value) / 100) * token.price24HChange;
            return {
              ...token,
              // price data
              // price,
              // price24HChange,
              // balanceDenorm,
              // balance,
              value: 0
              // value24HChange
            };
          })
      ],
      ['value', 'balance'],
      ['desc', 'desc']
    );

    if (request.getEther) {
      _tokens.unshift(store.getters['register/getEther']);
    }

    // search functionality, this can be better
    if (request.query) {
      return _tokens.filter(token => {
        token.name.includes(request.query) ||
          token.symbol.includes(request.query);
      });
    }

    if (request?.addresses?.length) {
      return request.addresses.map((address: any) =>
        _tokens.filter(
          token => token.address.toLowerCase() === address.toLowerCase()
        )
      );
    }

    return _tokens;
  });

  const toggleActiveTokenList = (name: string) => {
    console.log('DEBUG: BINGPOT', name);
    // remove from active lists
    if (activeTokenLists.value.includes(name)) {
      activeTokenLists.value = activeTokenLists.value.filter(
        listName => listName !== name
      );
      return;
    }
    activeTokenLists.value = [...activeTokenLists.value, name];
  };

  const isActiveList = (name: string) => {
    return activeTokenLists.value.includes(name);
  };

  watch(activeTokenLists, () => console.log('DEBUG: active', injectedTokens));

  return {
    isLoading,
    lists,
    toggleActiveTokenList,
    isActiveList,
    tokens
  };
}
