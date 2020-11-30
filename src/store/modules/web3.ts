import Vue from 'vue';
import { Web3Provider } from '@ethersproject/providers';
import { getInstance } from '@snapshot-labs/lock/plugins/vue';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { formatUnits } from '@ethersproject/units';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import store from '@/store';
import abi from '@/helpers/abi';

let wsProvider;
let auth;

if (wsProvider) {
  wsProvider.on('block', blockNumber => {
    store.commit('GET_BLOCK_SUCCESS', blockNumber);
  });
}

const state = {
  account: null,
  name: null,
  network: networks['1'],
  balances: {}
};

const mutations = {
  WEB3_SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      Vue.set(_state, key, payload[key]);
    });
  },
  LOGOUT(_state) {
    Vue.set(_state, 'account', null);
    Vue.set(_state, 'name', null);
    console.debug('LOGOUT');
  },
  LOAD_PROVIDER_REQUEST() {
    console.debug('LOAD_PROVIDER_REQUEST');
  },
  LOAD_PROVIDER_SUCCESS(_state, payload) {
    Vue.set(_state, 'account', payload.account);
    Vue.set(_state, 'name', payload.name);
    console.debug('LOAD_PROVIDER_SUCCESS');
  },
  LOAD_PROVIDER_FAILURE(_state, payload) {
    Vue.set(_state, 'account', null);
    console.debug('LOAD_PROVIDER_FAILURE', payload);
  },
  HANDLE_CHAIN_CHANGED(_state, chainId) {
    if (!networks[chainId]) {
      networks[chainId] = {
        ...networks['1'],
        chainId,
        name: 'Unknown',
        network: 'unknown'
      };
    }
    Vue.set(_state, 'network', networks[chainId]);
    console.debug('HANDLE_CHAIN_CHANGED', chainId);
  },
  HANDLE_ACCOUNTS_CHANGED(_state, payload) {
    Vue.set(_state, 'account', payload);
    console.debug('HANDLE_ACCOUNTS_CHANGED', payload);
  }
};

const actions = {
  login: async ({ dispatch, commit }, connector = 'injected') => {
    auth = getInstance();
    commit('SET', { authLoading: true });
    await auth.login(connector);
    if (auth.provider) {
      auth.web3 = new Web3Provider(auth.provider);
      await dispatch('loadProvider');
      await dispatch('getBalances');
    }
    commit('SET', { authLoading: false });
  },
  logout: async ({ commit }) => {
    Vue.prototype.$auth.logout();
    commit('LOGOUT');
  },
  loadProvider: async ({ commit, dispatch }) => {
    commit('LOAD_PROVIDER_REQUEST');
    try {
      if (auth.provider.removeAllListeners) auth.provider.removeAllListeners();
      if (auth.provider.on) {
        auth.provider.on('chainChanged', async chainId => {
          commit('HANDLE_CHAIN_CHANGED', parseInt(formatUnits(chainId, 0)));
          await dispatch('getBalances');
        });
        auth.provider.on('accountsChanged', async accounts => {
          if (accounts.length !== 0) {
            commit('HANDLE_ACCOUNTS_CHANGED', accounts[0]);
            await dispatch('loadProvider');
            await dispatch('getBalances');
          }
        });
        auth.provider.on('disconnect', async () => {
          commit('HANDLE_CLOSE');
        });
      }
      const [network, accounts] = await Promise.all([
        auth.web3.getNetwork(),
        auth.web3.listAccounts()
      ]);
      commit('HANDLE_CHAIN_CHANGED', network.chainId);
      const account = accounts.length > 0 ? accounts[0] : null;
      let name;
      try {
        name = await getProvider('1').lookupAddress(account);
      } catch (e) {
        console.error(e);
      }
      commit('LOAD_PROVIDER_SUCCESS', {
        account,
        name
      });
    } catch (e) {
      commit('LOAD_PROVIDER_FAILURE', e);
      return Promise.reject();
    }
  },
  getBalances: async ({ commit, rootGetters }) => {
    const tokens = rootGetters.getTokensWithBalances({});
    const account = state.account;
    const network = state.network.key;
    let balances = await multicall(
      network,
      getProvider(network),
      abi['TestToken'],
      tokens.map(token => [token.address, 'balanceOf', [account]])
    );
    balances = Object.fromEntries(
      tokens.map((token, i) => [token.address, balances[i][0]])
      //.filter(([, balance]) => balance.toString() !== '0')
    );
    commit('WEB3_SET', { balances });
  }
};

export default {
  state,
  mutations,
  actions
};
