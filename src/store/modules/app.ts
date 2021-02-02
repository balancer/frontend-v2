import Vue from 'vue';
import { lsGet, lsSet } from '@/utils';

const state = {
  init: false,
  loading: false,
  authLoading: false,
  modalOpen: false,
  spaces: {},
  skin: lsGet('skin', 'light')
};

const actions = {
  init: async ({ commit, dispatch }) => {
    commit('SET', { init: true });
    dispatch('loadTokenlists');
    dispatch('getBlockNumber');
    Vue.prototype.$auth.getConnector().then(connector => {
      if (connector) dispatch('login', connector);
    });
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
