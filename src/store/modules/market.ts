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
  async loadPrices({ commit, rootState, rootGetters }, tokens: string[] = []) {
    if (tokens.length === 0)
      tokens = Object.values(rootGetters['registry/getTokens']()).map(
        (token: any) => token.address
      );
    try {
      commit('setLoading', true);
      const chainId = rootState.web3.config.chainId;
      const [prices, etherPrice] = await Promise.all([
        getTokensPrice(chainId, tokens),
        getEtherPrice()
      ]);
      prices.ether = etherPrice;
      commit('addPrices', prices);
      commit('setLoading', false);
    } catch (e) {
      console.log(e);
    }
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
