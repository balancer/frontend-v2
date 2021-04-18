import getProvider from '@/utils/provider';
import { getAllowances, getBalances } from '@/utils/balancer/tokens';
import configs from '@/config';
import { ETHER } from '@/constants/tokenlists';
import { isAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';

type AddressToValue = Record<string, BigNumber>;

interface AccountState {
  balances: AddressToValue;
  allowances: AddressToValue;
  loading: boolean;
  loaded: boolean;
}

const state: AccountState = {
  balances: {},
  allowances: {},
  loading: false,
  loaded: false
};

const getters = {
  getPortfolioValue: (state, getters, rootState, rootGetters) => () => {
    const tokens = rootGetters['registry/getTokens']({ withBalance: true });
    const ether = rootGetters['registry/getEther']();
    return Object.values(tokens).reduce(
      (a: any, b: any) => a + b.value,
      ether.value || 0
    );
  },

  getRequiredAllowances: (state, getters, rootState) => query => {
    const config = rootState.web3.config.key;
    const tokens = query.tokens;
    const amounts = query.amounts;
    const dst = query.dst || configs[config].addresses.vault;
    const requiredAllowances = {};
    Object.entries(tokens).forEach(([token, allowance]: any) => {
      if (
        allowance !== '0' &&
        (!state.allowances[dst] ||
          !state.allowances[dst][token.toLowerCase()] ||
          state.allowances[dst][token.toLowerCase()].lt(allowance)) &&
        ['0.0', '0'].includes(amounts[token])
      ) {
        requiredAllowances[token] = allowance;
      }
    });
    return requiredAllowances;
  }
};

const actions = {
  resetAccount({ commit }) {
    commit('setBalances', {});
    commit('setAllowances', {});
    commit('setLoaded', false);
  },

  async getBalances({ commit, rootGetters, rootState }) {
    const account = rootState.web3.account;
    const tokens = rootGetters['registry/getTokens']();
    if (!account || Object.keys(tokens).length === 0) return;
    const network = rootState.web3.config.key;
    const provider = getProvider(network);
    commit('setLoading', true);
    const [balances, etherBalance] = await Promise.all([
      getBalances(
        network,
        provider,
        account,
        Object.values(tokens).map((token: any) => token.address)
      ),
      provider.getBalance(account)
    ]);
    balances.ether = etherBalance;
    commit('setBalances', balances);
    commit('setLoading', false);
    commit('setLoaded', true);
  },

  async getAllowances({ commit, rootGetters, rootState }, payload) {
    const config = rootState.web3.config.key;
    const account: string = rootState.web3.account;
    let tokens: string[] =
      payload?.tokens || Object.keys(rootGetters['registry/getTokens']());
    tokens = tokens.filter(
      token => token !== ETHER.address && isAddress(token)
    );
    if (!account || tokens.length === 0) return;
    const dst = payload?.dst || configs[config].addresses.vault;
    const network = rootState.web3.config.key;
    commit('setLoading', true);
    const dstAllowances = await getAllowances(
      network,
      getProvider(network),
      account,
      dst,
      tokens
    );
    const allowances = state.allowances;
    // @ts-ignore
    allowances[dst] = { ...dstAllowances, ...allowances[dst] };
    commit('setLoading', false);
    commit('setAllowances', allowances);
  }
};

const mutations = {
  setLoading(_state: AccountState, val: boolean): void {
    _state.loading = val;
  },

  setLoaded(_state: AccountState, val: boolean): void {
    _state.loaded = val;
  },

  setBalances(_state: AccountState, balances: AddressToValue): void {
    _state.balances = { ...balances };
  },

  setAllowances(_state: AccountState, allowances: AddressToValue): void {
    _state.allowances = { ...allowances };
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
};
