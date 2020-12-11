import Vue from 'vue';
import { getTokensPrice } from '@/utils/coingecko';

const state = {
  prices: {},
  loading: false
};

const actions = {
  loadPrices: async ({ commit, rootGetters }, tokens?) => {
    tokens = tokens || rootGetters.getTokensObj({});
    const addresses = Object.values(tokens).map((token: any) => token.address);
    try {
      commit('MARKET_SET', { loading: true });
      const prices = await getTokensPrice(addresses);
      commit('MARKET_SET', { prices, loading: false });
    } catch (e) {
      console.log(e);
    }
  }
};

const mutations = {
  MARKET_SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      Vue.set(_state, key, payload[key]);
    });
  }
};

export default {
  state,
  mutations,
  actions
};
