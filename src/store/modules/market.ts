import { getEtherPrice, getTokensPrice } from '@/api/coingecko';

type Prices = Record<string, number>;

interface MarketState {
  prices: Prices;
  loading: boolean;
}

const state: MarketState = {
  prices: {},
  loading: false
};

const actions = {
  async loadPrices({ commit, rootGetters }, tokens: string[] = []) {
    if (tokens.length === 0)
      tokens = Object.values(rootGetters['registry/getTokens']()).map(
        (token: any) => token.address
      );
    commit('setLoading', true);
    const chainId = Number(process.env.VUE_APP_NETWORK || 1);
    const [prices, etherPrice] = await Promise.all([
      getTokensPrice(chainId, tokens),
      getEtherPrice()
    ]);
    prices.ether = etherPrice;
    commit('addPrices', prices);
    commit('setLoading', false);
  }
};

const mutations = {
  addPrices(_state: MarketState, prices: Prices) {
    for (const asset in prices) {
      _state.prices[asset] = prices[asset];
    }
  },

  setLoading(_state: MarketState, val: boolean) {
    _state.loading = val;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
