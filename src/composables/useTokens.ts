import { Token, TokenMap } from '@/types';
import { getAddress } from '@ethersproject/address';
import { keyBy, orderBy, uniqBy } from 'lodash';
import { computed } from 'vue';
import { useStore } from 'vuex';
import useAccountBalances from './useAccountBalances';
import useTokenStore from './useTokensStore';

type TokenRequest = {
  query?: string;
  queryAddress?: string;
};

export default function useTokens(request?: TokenRequest) {
  const store = useStore();
  const prices = computed(() => store.state.market.prices);
  const { allTokens: _allTokens } = useTokenStore();
  const { balances } = useAccountBalances();

  const tokensList = computed(() => {
    const _tokens = uniqBy<Token>(
      orderBy(
        // populate token data into list of tokens
        Object.values(_allTokens.value).map(token => {
          const balance =
            (balances.value || {})[token.address.toLowerCase()]?.balance || '0';
          const price = prices.value[token.address.toLowerCase()]?.price || 0;
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
        }),
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

  const tokens = computed(() => keyBy(tokensList.value, 'address') as TokenMap);

  return { tokens };
}
