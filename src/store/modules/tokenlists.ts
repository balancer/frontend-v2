import Vue from 'vue';
import { loadTokenlist } from '@/utils/tokenlists';
import { TOKEN_LIST_DEFAULT } from '@/constants/tokenlists';
import { clone } from '@/helpers/utils';

const state = {
  currentTokenlist: '',
  tokenlists: {}
};

const mutations = {
  TOKENLISTS_SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      Vue.set(_state, key, payload[key]);
    });
  }
};

const getters = {
  getTokens: (state, getters, rootState) => {
    return state.tokenlists[state.currentTokenlist].tokens.filter(
      token => token.chainId === rootState.web3.network.chainId
    );
  },
  getCurrentTokenlist: state => {
    const tokenlist = clone(state.tokenlists[state.currentTokenlist]);
    delete tokenlist.tokens;
    return tokenlist;
  }
};

const actions = {
  loadTokenlist: async ({ commit }, name) => {
    name = name || TOKEN_LIST_DEFAULT;
    const tokenlist = await loadTokenlist(name);
    const tokenlists = state.tokenlists;
    tokenlists[name] = tokenlist;
    commit('TOKENLISTS_SET', { tokenlists });
  },
  setTokenlist: ({ commit }, name) => {
    name = name || TOKEN_LIST_DEFAULT;
    commit('TOKENLISTS_SET', { currentTokenlist: name });
  }
};

export default {
  state,
  mutations,
  getters,
  actions
};
