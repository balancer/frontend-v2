import Vue from 'vue';

const state = {
  init: false,
  loading: false,
  modalOpen: false,
  spaces: {}
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
    commit('SET', { loading: true });
    const connector = await Vue.prototype.$auth.getConnector();
    if (connector) await dispatch('login', connector);
    commit('SET', { loading: false, init: true });
  },
  loading: ({ commit }, payload) => {
    commit('SET', { loading: payload });
  },
  toggleModal: ({ commit }) => {
    commit('SET', { modalOpen: !state.modalOpen });
  }
};

export default {
  state,
  mutations,
  actions
};
