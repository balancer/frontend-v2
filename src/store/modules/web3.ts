import { Web3Provider } from '@ethersproject/providers';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { formatUnits } from '@ethersproject/units';
import configs, { Config } from '@/config';
import { getProfiles } from '@/utils/profile';
import useFathom from '@/composables/useFathom';

const defaultConfig = process.env.VUE_APP_NETWORK || '1';

const { trackGoal, Goals } = useFathom();

let auth;

interface Web3State {
  loading: boolean;
  account: string | null;
  profile: {};
  config: Config;
  connector: string;
  blockNumber: number | null;
  modal: boolean;
  loadingAccountData: boolean;
}

const state: Web3State = {
  loading: false,
  account: null,
  profile: {},
  config: configs[defaultConfig],
  connector: 'injected',
  blockNumber: null,
  modal: false,
  loadingAccountData: false
};

const getters = {
  getConfig: state => () => {
    return state.config;
  }
};

const actions = {
  async login({ dispatch, commit, state }, connector = 'injected') {
    commit('setLoading', true);

    auth = getInstance();
    await auth.login(connector);

    if (auth.provider.value) {
      auth.web3 = new Web3Provider(auth.provider.value);
      await dispatch('loadProvider');
    }

    if (state.account) trackGoal(Goals.ConnectedWallet);

    commit('setLoading', false);
    commit('setConnector', connector);
    await dispatch('loadAccountData');
  },

  async loadAccountData({ commit, dispatch, state }) {
    await dispatch('account/getBalances', null, { root: true });
    await dispatch('account/getAllowances', null, { root: true });
    if (state.account) {
      const profiles = await getProfiles([state.account]);
      commit('setProfile', profiles[state.account]);
    }
  },

  async logout({ commit, dispatch }) {
    auth = getInstance();
    auth.logout();
    commit('logout');
    dispatch('account/resetAccount', null, { root: true });
  },

  async loadProvider({ commit, dispatch }) {
    try {
      if (
        auth.provider.value.removeAllListeners &&
        !auth.provider.value.isTorus
      )
        auth.provider.value.removeAllListeners();
      if (auth.provider.value.on) {
        auth.provider.value.on('chainChanged', async chainId => {
          commit('setNetwork', parseInt(formatUnits(chainId, 0)));
          dispatch('account/resetAccount', null, { root: true });
          dispatch('account/getBalances', null, { root: true });
          dispatch('account/getAllowances', null, { root: true });
        });
        auth.provider.value.on('accountsChanged', async accounts => {
          if (accounts.length !== 0) {
            dispatch('account/resetAccount', null, { root: true });
            commit('setAccount', accounts[0]);
            await dispatch('loadProvider');
            dispatch('account/getBalances', null, { root: true });
            dispatch('account/getAllowances', null, { root: true });
          }
        });
        auth.provider.value.on('disconnect', async () => {
          dispatch('account/resetAccount', null, { root: true });
        });
      }

      const [network, accounts] = await Promise.all([
        auth.web3.getNetwork(),
        auth.web3.listAccounts()
      ]);

      commit('setNetwork', network.chainId);

      const account = accounts.length > 0 ? accounts[0] : null;

      commit('setAccount', account);
    } catch (e) {
      commit('setAccount', null);
      console.debug('LOAD_PROVIDER_FAILURE', e);
      return Promise.reject(e);
    }
  }
};

const mutations = {
  setLoading(_state: Web3State, val: boolean): void {
    _state.loading = val;
  },

  setLoadingAccountData(_state: Web3State, val: boolean): void {
    _state.loadingAccountData = val;
  },

  logout(_state: Web3State) {
    _state.account = null;
    _state.profile = {};
  },

  setAccount(_state: Web3State, account: string): void {
    _state.account = account;
  },

  setProfile(_state: Web3State, profile) {
    _state.profile = profile;
  },

  setNetwork(_state: Web3State, chainId: number): void {
    if (!configs[chainId]) {
      configs[chainId] = {
        ...configs[defaultConfig],
        unknown: true,
        shortName: ''
      };
    }
    _state.config = configs[chainId];
  },

  setConnector(_state: Web3State, connector: string): void {
    _state.connector = connector;
  },

  setBlockNumber(_state: Web3State, blockNumber: number): void {
    _state.blockNumber = blockNumber;
  },

  setAccountModal(_state: Web3State, val: boolean) {
    _state.modal = val;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
};
