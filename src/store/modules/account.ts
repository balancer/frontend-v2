import Vue from 'vue';
import getProvider from '@/utils/provider';
import { getAllowances, getBalances } from '@/utils/balancer/tokens';
import { getInstance } from '@snapshot-labs/lock/plugins/vue';
import constants from '@/utils/balancer/constants';

const state = {
  balances: {},
  allowances: {},
  loading: false,
  loaded: false
};

const getters = {
  getPortfolioValue: (state, getters, rootState, rootGetters) => () => {
    const tokens = rootGetters.getTokens({ withBalance: true });
    const ether = rootGetters.getEther();
    return Object.values(tokens).reduce(
      (a: any, b: any) => a + b.value,
      ether.value || 0
    );
  },
  getRequiredAllowances: state => query => {
    const tokens = query.tokens;
    const dst = query.dst || constants.vault;
    const requiredAllowances = {};
    Object.entries(tokens).forEach(([token, allowance]: any) => {
      if (
        allowance !== '0' &&
        (!state.allowances[dst] ||
          !state.allowances[dst][token.toLowerCase()] ||
          state.allowances[dst][token.toLowerCase()].lt(allowance))
      ) {
        requiredAllowances[token] = allowance;
      }
    });
    return requiredAllowances;
  }
};

const actions = {
  resetAccount({ commit }) {
    commit('ACCOUNT_SET', {
      balances: {},
      allowances: {},
      loaded: false
    });
  },
  getBalances: async ({ commit, rootGetters, rootState }) => {
    const auth = getInstance();
    const account = rootState.web3.account;
    const tokens = rootGetters.getTokens();
    if (!account || Object.keys(tokens).length === 0) return;
    const network = rootState.web3.network.key;
    commit('ACCOUNT_SET', { loading: true });
    const [balances, etherBalance] = await Promise.all([
      getBalances(
        network,
        getProvider(network),
        account,
        Object.values(tokens).map((token: any) => token.address)
      ),
      auth.web3.getBalance(account)
    ]);
    balances.ether = etherBalance;
    commit('ACCOUNT_SET', { balances, loading: false, loaded: true });
  },
  getAllowances: async ({ commit, rootGetters, rootState }, payload) => {
    const account = rootState.web3.account;
    const tokens = payload?.tokens || rootGetters.getTokens();
    if (!account || Object.keys(tokens).length === 0) return;
    const dst = payload?.dst || constants.vault;
    const network = rootState.web3.network.key;
    commit('ACCOUNT_SET', { loading: true });
    const dstAllowances = await getAllowances(
      network,
      getProvider(network),
      account,
      dst,
      Object.values(tokens).map((token: any) => token.address)
    );
    const allowances = state.allowances;
    allowances[dst] = { ...dstAllowances, ...allowances[dst] };
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
