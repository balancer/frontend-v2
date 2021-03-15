import { Web3Provider } from '@ethersproject/providers';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { formatUnits } from '@ethersproject/units';
import Notify from 'bnc-notify';
import configs from '@/config';
import { getProfiles } from '@/utils/profile';
import store from '@/store';
import getProvider from '@/utils/provider';

const defaultConfig = process.env.VUE_APP_DEFAULT_NETWORK || '1';
const BLOCKNATIVE_DAPP_ID = process.env.VUE_APP_BLOCKNATIVE_DAPP_ID || '';

let auth;
let notify;

const state = {
  account: null,
  profile: {},
  config: configs[defaultConfig],
  connector: 'injected',
  blockNumber: null
};

const mutations = {
  WEB3_SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      _state[key] = payload[key];
    });
  },
  LOGOUT(_state) {
    _state.account = null;
    _state.name = null;
    console.debug('LOGOUT');
  },
  LOAD_PROVIDER_FAILURE(_state, payload) {
    _state.account = null;
    console.debug('LOAD_PROVIDER_FAILURE', payload);
  },
  HANDLE_CHAIN_CHANGED(_state, chainId) {
    if (!configs[chainId]) {
      configs[chainId] = {
        ...configs[defaultConfig],
        unknown: true,
        shortName: undefined
      };
    }
    _state.config = configs[chainId];
    console.debug('HANDLE_CHAIN_CHANGED', chainId);
  },
  HANDLE_ACCOUNTS_CHANGED(_state, payload) {
    _state.account = payload;
    console.debug('HANDLE_ACCOUNTS_CHANGED', payload);
  }
};

const actions = {
  login: async ({ dispatch, commit }, connector = 'injected') => {
    auth = getInstance();
    commit('setAuthLoading', true);
    await auth.login(connector);
    if (auth.provider.value) {
      auth.web3 = new Web3Provider(auth.provider.value);
      await dispatch('loadProvider');
      dispatch('getBalances');
      dispatch('getAllowances');
    }
    commit('setAuthLoading', false);
    commit('WEB3_SET', { connector });
  },
  logout: async ({ commit }) => {
    auth = getInstance();
    auth.logout();
    commit('LOGOUT');
  },
  getBlockNumber: async () => {
    const blockNumber = await getProvider(state.config.key).getBlockNumber();
    store.commit('WEB3_SET', { blockNumber });
  },
  loadProvider: async ({ commit, dispatch }) => {
    try {
      if (
        auth.provider.value.removeAllListeners &&
        !auth.provider.value.isTorus
      )
        auth.provider.value.removeAllListeners();
      if (auth.provider.value.on) {
        auth.provider.value.on('chainChanged', async chainId => {
          commit('HANDLE_CHAIN_CHANGED', parseInt(formatUnits(chainId, 0)));
          dispatch('loadPools');
          dispatch('resetAccount');
          dispatch('getBalances');
          dispatch('getAllowances');
          dispatch('getBlockNumber');
        });
        auth.provider.value.on('accountsChanged', async accounts => {
          if (accounts.length !== 0) {
            commit('HANDLE_ACCOUNTS_CHANGED', accounts[0]);
            dispatch('resetAccount');
            await dispatch('loadProvider');
            dispatch('getBalances');
            dispatch('getAllowances');
          }
        });
        auth.provider.value.on('disconnect', async () => {
          commit('HANDLE_CLOSE');
        });
      }

      const [network, accounts] = await Promise.all([
        auth.web3.getNetwork(),
        auth.web3.listAccounts()
      ]);
      commit('HANDLE_CHAIN_CHANGED', network.chainId);

      const account = accounts.length > 0 ? accounts[0] : null;
      const profiles = await getProfiles([account]);
      await dispatch('getBlockNumber');

      if (BLOCKNATIVE_DAPP_ID) {
        if (notify && state.account) {
          notify.unsubscribe(state.account);
        }

        notify = Notify({
          dappId: BLOCKNATIVE_DAPP_ID,
          networkId: network.chainId
        });

        const { emitter } = notify.account(account);

        emitter.on('all', transaction => {
          if (transaction.status === 'confirmed') dispatch('getBalances');
          return false;
        });
      }

      commit('WEB3_SET', { account, profile: profiles[account] });
    } catch (e) {
      commit('LOAD_PROVIDER_FAILURE', e);
      return Promise.reject(e);
    }
  }
};

export default {
  state,
  mutations,
  actions
};
