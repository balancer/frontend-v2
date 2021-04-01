import { getEtherPrice, getTokensPrice } from '@/api/coingecko';

const state = {
  prices: {},
  loading: false
};

const actions = {
  loadPrices: async ({ commit, rootState, rootGetters }, tokens?) => {
    if (!tokens)
      tokens = Object.values(rootGetters.getTokens()).map(
        (token: any) => token.address
      );
    try {
      commit('MARKET_SET', { loading: true });
      const chainId = rootState.web3.config.chainId;
      const [prices, etherPrice] = await Promise.all([
        getTokensPrice(chainId, tokens),
        getEtherPrice()
      ]);
      prices.ether = etherPrice;
      commit('MARKET_SET', { prices, loading: false });
    } catch (e) {
      console.log(e);
    }
  }
};

const mutations = {
  MARKET_SET(_state, payload) {
    const { prices, loading } = payload;
    _state.loading = loading;
    if (prices) {
      for (const asset in prices) {
        const price = prices[asset];
        _state.prices[asset] = price;
      }
    }
  }
};

export default {
  state,
  mutations,
  actions
};
