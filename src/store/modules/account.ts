import Vue from 'vue';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { getAllowances, getBalances } from '@/utils/balancer/utils/tokens';

const state = {
  balances: {},
  allowances: {},
  loading: false
};

const getters = {
  getAllowances: (state, getters, rootState) => required => {
    return required;
  }
};

const actions = {
  resetAccount({ commit }) {
    commit('ACCOUNT_SET', { balances: {}, allowances: {} });
  },
  getBalances: async ({ commit, rootGetters, rootState }) => {
    const account = rootState.web3.account;
    const tokens = rootGetters.getTokens();
    if (!account || Object.keys(tokens).length === 0) return;
    const network = rootState.web3.network.key;
    commit('ACCOUNT_SET', { loading: true });
    const balances = await getBalances(
      network,
      getProvider(network),
      account,
      Object.values(tokens).map((token: any) => token.address)
    );
    commit('ACCOUNT_SET', { balances, loading: false });
  },
  getAllowances: async ({ commit, rootGetters, rootState }, tokens?) => {
    const account = rootState.web3.account;
    tokens = tokens || rootGetters.getTokens();
    if (!account || Object.keys(tokens).length === 0) return;
    const dst = account;
    const network = rootState.web3.network.key;
    commit('ACCOUNT_SET', { loading: true });
    const allowances = await getAllowances(
      network,
      getProvider(network),
      account,
      dst,
      Object.values(tokens).map((token: any) => token.address)
    );
    commit('ACCOUNT_SET', { allowances, loading: false });
  }
};

const mutations = {
  ACCOUNT_SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      Vue.set(_state, key, payload[key]);
    });
  }
};

export default {
  state,
  mutations,
  getters,
  actions
};
