import Vue from 'vue';
import { lsGet, lsSet } from '@/utils';
import i18n, { defaultLocale } from '@/i18n';

const state = {
  init: false,
  loading: false,
  authLoading: false,
  modalOpen: false,
  spaces: {},
  skin: lsGet('skin', 'light'),
  locale: lsGet('locale', defaultLocale)
};

const actions = {
  init: async ({ commit, dispatch }) => {
    commit('SET', { init: true });
    dispatch('loadTokenlists');
    dispatch('getBlockNumber');
    Vue.prototype.$auth.getConnector().then(connector => {
      if (connector) dispatch('login', connector);
    });
    i18n.locale = state.locale;
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
    i18n.locale = locale;
    commit('SET', { locale });
  }
};

const mutations = {
  SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      Vue.set(_state, key, payload[key]);
    });
  }
};

export default {
  state,
  mutations,
  actions
};
