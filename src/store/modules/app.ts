import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { lsGet, lsSet } from '@/utils';
import i18n, { defaultLocale } from '@/i18n';

const state = {
  init: false,
  loading: false,
  authLoading: false,
  modalOpen: false,
  skin: lsGet('skin', 'light'),
  locale: lsGet('locale', defaultLocale),
  slippage: lsGet('slippage', '0.01')
};

const actions = {
  init: async ({ commit, dispatch }) => {
    commit('SET', { init: true });
    dispatch('loadRegistry');
    dispatch('getBlockNumber');
    const auth = getInstance();
    auth.getConnector().then(connector => {
      if (connector) dispatch('login', connector);
    });
    i18n.global.locale = state.locale;
  },
  loading: ({ commit }, payload) => {
    commit('SET', { loading: payload });
  },
  toggleModal: ({ commit }) => {
    commit('SET', { modalOpen: !state.modalOpen });
  },
  setSkin: async ({ commit }, skin) => {
    lsSet('skin', skin);
    commit('SET', { skin });
  },
  setLocale: async ({ commit }, locale) => {
    lsSet('locale', locale);
    i18n.global.locale = locale;
    commit('SET', { locale });
  },
  setSlippage: async ({ commit }, slippage) => {
    lsSet('slippage', slippage);
    commit('SET', { slippage });
  }
};

const mutations = {
  SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      _state[key] = payload[key];
    });
  }
};

export default {
  state,
  mutations,
  actions
};
