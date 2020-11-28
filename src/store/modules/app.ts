import Vue from 'vue';

const state = {
  init: false,
  loading: false,
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
    commit('SET', { loading: true });
    await dispatch('loadTokenlist');
    dispatch('setTokenlist');
    const connector = await Vue.prototype.$auth.getConnector();
    if (connector) dispatch('login', connector);
    commit('SET', { loading: false, init: true });
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
