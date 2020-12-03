import Vue from 'vue';
import { loadTokenlist } from '@/utils/tokenlists';
import { TOKEN_LIST_DEFAULT, TOKEN_LISTS } from '@/constants/tokenlists';
import { clone } from '@/helpers/utils';
import { formatUnits } from '@ethersproject/units';
import orderBy from 'lodash/orderBy';
import BN from 'bn.js';

const state = {
  currentTokenlist: TOKEN_LIST_DEFAULT,
  tokenlists: Object.fromEntries(TOKEN_LISTS.map(tokenlist => [tokenlist, {}])),
  loading: false
};

const mutations = {
  REGISTRY_SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      Vue.set(_state, key, payload[key]);
    });
  }
};

const getters = {
  getTokens: (state, getters, rootState) => ({ q }) => {
    if (state.loading) return [];

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

    tokens = tokens.map(token => {
      const address = token.address.toLowerCase();
      token.price = rootState.market.prices[address] || 0;
      return token;
    });

    if (rootState.web3.account) {
      tokens = tokens.map(token => {
        const address = token.address.toLowerCase();
        token.balance = formatUnits(
          rootState.web3.balances[address] || new BN(0),
          token.decimals
        );
        token.value = token.balance * token.price;
        return token;
      });
      tokens = orderBy(tokens, ['value', 'balance'], ['desc', 'desc']);
    }

    return tokens.slice(0, 50);
  },
  getCurrentTokenlist: state => {
    const tokenlist = clone(state.tokenlists[state.currentTokenlist]);
    delete tokenlist.tokens;
    return tokenlist;
  },
  getTokenlists: (state, getters, rootState) => ({ q }) => {
    const tokenlists = clone(state.tokenlists);
    return Object.fromEntries(
      Object.entries(tokenlists)
        .map((tokenlist: any) => {
          tokenlist[1].tokens = tokenlist[1].tokens
            ? tokenlist[1].tokens.filter(
                token => token.chainId === rootState.web3.network.chainId
              )
            : [];
          return tokenlist;
        })
        .filter(tokenlist => tokenlist[1].tokens.length > 0)
        .filter(tokenlist =>
          q
            ? `${tokenlist[0]} ${tokenlist[1].name}`
                .toLowerCase()
                .includes(q.toLowerCase())
            : true
        )
    );
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
  loadTokenlists: async ({ dispatch, commit }) => {
    commit('REGISTRY_SET', { loading: true });
    await Promise.all(TOKEN_LISTS.map(name => dispatch('loadTokenlist', name)));
    commit('REGISTRY_SET', { loading: false });
    dispatch('getBalances');
    dispatch('loadPrices');
  },
  setTokenlist: ({ commit, dispatch }, name) => {
    commit('REGISTRY_SET', { currentTokenlist: name });
    dispatch('getBalances');
    dispatch('loadPrices');
  }
};

export default {
  state,
  mutations,
  getters,
  actions
};
