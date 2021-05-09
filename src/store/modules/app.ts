import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { lsGet, lsSet } from '@/utils';
import i18n from '@/plugins/i18n';
import { LiquiditySelection } from '@/utils/balancer/helpers/sor/sorManager';

export interface AppState {
  loading: boolean;
  modalOpen: boolean;
  darkMode: boolean;
  locale: string;
  slippage: string;
  tradeLiquidity: LiquiditySelection;
}

const state: AppState = {
  loading: true,
  modalOpen: false,
  darkMode: false,
  // locale: defaultLocale,
  locale: 'en-US',
  slippage: '0.01',
  tradeLiquidity: LiquiditySelection.Best
};

const actions = {
  init: async ({ commit, dispatch }) => {
    try {
      // Set defaults from localStorage
      commit('setLocale', lsGet('locale', 'en-US'));
      commit('setDarkMode', lsGet('darkMode', false));
      commit('setSlippage', lsGet('slippage', '0.01'));
      commit(
        'setTradeLiquidity',
        lsGet('tradeLiquidity', LiquiditySelection.Best)
      );

      // Setup web3
      const auth = getInstance();
      const connector = await auth.getConnector();
      if (connector) dispatch('web3/login', connector, { root: true });

      // Fetch init data
      await dispatch('registry/get', null, { root: true });
      await dispatch('market/loadPrices', [], { root: true });
      await dispatch('market/getGasPrice', [], { root: true });

      // Fetch initial trade tokens
      dispatch('trade/init', null, { root: true });

      commit('setLoading', false);
    } catch (error) {
      console.error('Failed to initialize app', error);
    }
  }
};

const mutations = {
  setLoading(state: AppState, val: boolean): void {
    state.loading = val;
  },

  toggleModal(state: AppState): void {
    state.modalOpen = !state.modalOpen;
  },

  setLocale(state: AppState, locale: string): void {
    state.locale = locale;
    lsSet('locale', locale);
    i18n.global.locale = locale;
  },

  setSlippage(state: AppState, slippage: string): void {
    state.slippage = slippage;
    lsSet('slippage', slippage);
  },

  setDarkMode(state: AppState, val: boolean): void {
    state.darkMode = val;
    lsSet('darkMode', state.darkMode);
    if (state.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  },

  setTradeLiquidity(state: AppState, tradeLiquidity: LiquiditySelection): void {
    state.tradeLiquidity = tradeLiquidity;
    lsSet('tradeLiquidity', state.tradeLiquidity);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
