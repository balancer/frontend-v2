import { getEtherPrice, getTokensPrice } from '@/utils/coingecko';

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
      const chainId = rootState.web3.network.chainId;
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
    Object.keys(payload).forEach(key => {
      _state[key] = payload[key];
    });
  }
};

export default {
  state,
  mutations,
  actions
};
