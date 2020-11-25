import Vue from 'vue';
import { loadTokenlist } from '@/utils/tokenlists';
import { TOKEN_LIST_DEFAULT } from '@/constants/tokenlists';

const state = {
  init: false,
  loading: false,
  modalOpen: false,
  spaces: {},
  tokenlist: {},
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
    const connector = await Vue.prototype.$auth.getConnector();
    if (connector) await dispatch('login', connector);
    await dispatch('loadTokenlist');
    commit('SET', { loading: false, init: true });
  },
  loading: ({ commit }, payload) => {
    commit('SET', { loading: payload });
  },
  toggleModal: ({ commit }) => {
    commit('SET', { modalOpen: !state.modalOpen });
  },
  loadTokenlist: async ({ commit }, name) => {
    const tokenlist = await loadTokenlist(name || TOKEN_LIST_DEFAULT);
    commit('SET', { tokenlist });
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
