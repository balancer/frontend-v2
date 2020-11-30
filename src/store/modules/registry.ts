import Vue from 'vue';
import { loadTokenlist } from '@/utils/tokenlists';
import { TOKEN_LIST_DEFAULT, TOKEN_LISTS } from '@/constants/tokenlists';
import { clone } from '@/helpers/utils';
import { formatUnits } from '@ethersproject/units';
import BN from 'bn.js';

const state = {
  currentTokenlist: TOKEN_LIST_DEFAULT,
  tokenlists: Object.fromEntries(TOKEN_LISTS.map(tokenlist => [tokenlist, {}]))
};

const mutations = {
  REGISTRY_SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      Vue.set(_state, key, payload[key]);
    });
  }
};

const getters = {
  getTokensWithBalances: (state, getters, rootState) => ({ q }) => {
    const currentTokenlist = state.tokenlists[state.currentTokenlist];
    let tokens = currentTokenlist.tokens || [];

    tokens = tokens.filter(
      token => token.chainId === rootState.web3.network.chainId
    );

    tokens = tokens.map(token => {
      token.balance = 0;
      return token;
    });

    if (q) {
      tokens = tokens.filter(token =>
        JSON.stringify([token.address, token.symbol, token.name])
          .toLowerCase()
          .includes(q.toLowerCase())
      );
    }

    if (rootState.web3.account) {
      tokens = tokens
        .map(token => {
          token.balance = formatUnits(
            rootState.web3.balances[token.address] || new BN(0),
            token.decimals
          );
          return token;
        })
        .sort((a, b) => b.balance - a.balance);
    }

    return tokens;
  },
  getCurrentTokenlist: state => {
    const tokenlist = clone(state.tokenlists[state.currentTokenlist]);
    delete tokenlist.tokens;
    return tokenlist;
  },
  getTokenlists: state => {
    return state.tokenlists;
  }
};

const actions = {
  loadTokenlist: async ({ commit }, name) => {
    name = name || TOKEN_LIST_DEFAULT;
    try {
      const tokenlist = await loadTokenlist(name);
      const tokenlists = clone(state.tokenlists);
      tokenlists[name] = tokenlist;
      commit('REGISTRY_SET', { tokenlists });
    } catch (e) {
      console.error(e);
    }
  },
  loadTokenlists: async ({ dispatch }) => {
    await Promise.all(TOKEN_LISTS.map(name => dispatch('loadTokenlist', name)));
  },
  setTokenlist: ({ commit }, name) => {
    commit('REGISTRY_SET', { currentTokenlist: name });
  }
};

export default {
  state,
  mutations,
  getters,
  actions
};
