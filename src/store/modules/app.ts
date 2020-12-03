import Vue from 'vue';

const state = {
  init: false,
  loading: false,
  authLoading: false,
  modalOpen: false,
  spaces: {},
  skin: 'light'
};

const mutations = {
  SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      Vue.set(_state, key, payload[key]);
    });
  }
};

const actions = {
  init: async ({ commit, dispatch }) => {
    // commit('SET', { loading: true });
    commit('SET', { init: true });
    dispatch('loadTokenlists');
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
    commit('SET', { skin });
  }
};

export default {
  state,
  mutations,
  actions
};
