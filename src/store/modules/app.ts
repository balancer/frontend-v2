import LS_KEYS from '@/constants/local-storage.keys';
import { lsGet, lsSet } from '@/lib/utils';
import i18n from '@/plugins/i18n';

export interface AppState {
  modalOpen: boolean;
  locale: string;
  transactionDeadline: number;
}

const state: AppState = {
  modalOpen: false,
  locale: lsGet(LS_KEYS.App.Locale, 'en-US'),
  transactionDeadline: lsGet(LS_KEYS.App.SwapDeadline, 100), // minutes
};

const actions = {
  init: async ({ dispatch }) => {
    try {
      // Fetch initial swap tokens
      dispatch('swap/init', null, { root: true });
    } catch (error) {
      console.error('Failed to initialize app', error);
    }
  },
};

const mutations = {
  toggleModal(state: AppState) {
    state.modalOpen = !state.modalOpen;
  },

  setLocale(state: AppState, locale: AppState['locale']) {
    state.locale = locale;
    lsSet(LS_KEYS.App.Locale, locale);
    i18n.global.locale.value = locale;
  },

  setTransactionDeadline(
    state: AppState,
    transactionDeadline: AppState['transactionDeadline']
  ) {
    state.transactionDeadline = transactionDeadline;
    lsSet(LS_KEYS.App.SwapDeadline, state.transactionDeadline);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
