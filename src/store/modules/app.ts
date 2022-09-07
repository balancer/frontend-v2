import LS_KEYS from '@/constants/local-storage.keys';
import { lsGet, lsSet } from '@/lib/utils';
import i18n from '@/plugins/i18n';

export interface AppState {
  loading: boolean;
  modalOpen: boolean;
  locale: string;
  transactionDeadline: number;
}

const state: AppState = {
  loading: true,
  modalOpen: false,
  locale: lsGet(LS_KEYS.App.Locale, 'en-US'),
  transactionDeadline: lsGet(LS_KEYS.App.TradeDeadline, 20), // minutes
};

const actions = {
  init: async ({ commit, dispatch }) => {
    try {
      // Fetch initial trade tokens
      dispatch('trade/init', null, { root: true });

      commit('setLoading', false);
    } catch (error) {
      console.error('Failed to initialize app', error);
    }
  },
};

const mutations = {
  setLoading(state: AppState, val: AppState['loading']) {
    state.loading = val;
  },

  toggleModal(state: AppState) {
    state.modalOpen = !state.modalOpen;
  },

  setLocale(state: AppState, locale: AppState['locale']) {
    state.locale = locale;
    lsSet(LS_KEYS.App.Locale, locale);
    i18n.global.locale = locale;
  },

  setTransactionDeadline(
    state: AppState,
    transactionDeadline: AppState['transactionDeadline']
  ) {
    state.transactionDeadline = transactionDeadline;
    lsSet(LS_KEYS.App.TradeDeadline, state.transactionDeadline);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
