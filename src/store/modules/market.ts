import Vue from 'vue';
import { getTokensPrice } from '@/utils/coingecko';

const state = {
  prices: {}
};

const mutations = {
  MARKET_SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      Vue.set(_state, key, payload[key]);
    });
  }
};

const actions = {
  loadPrices: async ({ commit, rootGetters }) => {
    const tokens = rootGetters.getTokens({}).map(token => token.address);
    try {
      const prices = await getTokensPrice(tokens);
      commit('MARKET_SET', { prices });
    } catch (e) {
      console.log(e);
    }
  }
};

export default {
  state,
  mutations,
  actions
};
