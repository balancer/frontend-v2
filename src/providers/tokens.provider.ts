import { Token, TokenMap } from '@/types';
import { getAddress } from '@ethersproject/address';
import { keyBy, orderBy, uniqBy } from 'lodash';
import { computed, provide, Ref, ref } from 'vue';
import { useStore } from 'vuex';
import useAccountBalances from '@/composables/useAccountBalances';
import useTokenStore from '@/composables/useTokensStore';

export type TokenRequest = {
  query?: Ref<string>;
  queryAddress?: Ref<string>;
};

export const TokensProviderSymbol = Symbol('TOKENS_PROVIDER');

export type TokensProviderPayload = {
  tokens: Ref<TokenMap>;
  updateTokenRequest: (request: TokenRequest) => void;
};

export default {
  name: 'TokenListsProvider',
  setup(props, { slots }) {
    const request = ref<TokenRequest>();
    const store = useStore();
    const prices = computed(() => store.state.market.prices);
    const { allTokens: _allTokens } = useTokenStore();
    const { balances } = useAccountBalances();

    const updateTokenRequest = (_request: TokenRequest) => {
      request.value = _request;
    };

    const tokensList = computed(() => {
      const _tokens = uniqBy<Token>(
        orderBy(
          // populate token data into list of tokens
          Object.values(_allTokens.value).map(token => {
            const balance =
              (balances.value || {})[token.address.toLowerCase()]?.balance ||
              '0';
            const price = prices.value[token.address.toLowerCase()]?.price || 0;
            const value = Number(balance) * price;
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
          }),
          ['value', 'balance'],
          ['desc', 'desc']
        ),
        'address'
      );

      if (request.value?.queryAddress) {
        const queryAddressLC = request?.value.queryAddress?.value.toLowerCase();

        return _tokens.filter(
          token => token.address?.toLowerCase() === queryAddressLC
        );
      }

      // search functionality, this can be better
      if (request?.value?.query) {
        const queryLC = request?.value.query?.value.toLowerCase();

        return _tokens.filter(
          token =>
            token.name.toLowerCase().includes(queryLC) ||
            token.symbol.toLowerCase().includes(queryLC)
        );
      }

      return _tokens;
    });
    const tokens = computed(
      () => keyBy(tokensList.value, 'address') as TokenMap
    );

    const payload = { tokens, updateTokenRequest };
    provide(TokensProviderSymbol, payload);

    return () => slots.default();
  }
};
