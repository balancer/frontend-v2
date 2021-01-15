import Vue from 'vue';
import {formatUnits} from '@ethersproject/units';
import {isAddress} from '@ethersproject/address';
import getProvider from '@/utils/provider';
import orderBy from 'lodash/orderBy';
import BN from 'bn.js';
import { loadTokenlist } from '@/utils/tokenlists';
import { TOKEN_LIST_DEFAULT, TOKEN_LISTS } from '@/constants/tokenlists';
import { clone, lsSet } from '@/utils';
import { getTokensMetadata } from '@/utils/balancer/utils/tokens';

const state = {
  currentTokenlist: TOKEN_LIST_DEFAULT,
  tokenlists: Object.fromEntries(TOKEN_LISTS.map(tokenlist => [tokenlist, {}])),
  injected: [],
  loading: false,
  loaded: false
};

const getters = {
  getTokens: (state, getters, rootState) => (query: any = {}) => {
    const { q, addresses, not } = query;
    const currentTokenlist = state.tokenlists[state.currentTokenlist] || {};
    let tokens = clone(currentTokenlist.tokens || []);
    const injected = Object.fromEntries(
      clone(state.injected).map(token => [token.address, token])
    );
    tokens = Object.fromEntries(tokens.map(token => [token.address, token]));
    tokens = Object.values({ ...injected, ...tokens });

    tokens = tokens.filter(
      token => token.chainId === rootState.web3.network.chainId
    );

    tokens = tokens.map(token => {
      token.balance = 0;
      token.balanceDenorm = '0';
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
        token.balanceDenorm = rootState.account.balances[address] || new BN(0);
        token.balance = formatUnits(token.balanceDenorm, token.decimals);
        token.value = token.balance * token.price;
        return token;
      });
      tokens = orderBy(tokens, ['value', 'balance'], ['desc', 'desc']);
    }

    if (addresses) {
      tokens = addresses.map(
        (address: any) =>
          tokens.filter(
            token => token.address.toLowerCase() === address.toLowerCase()
          )[0]
      );
    }

    if (not) {
      tokens = tokens.filter(token => !not.includes(token.address));
    }

    return Object.fromEntries(tokens.map(token => [token.address, token]));
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
    commit('REGISTRY_SET', { loading: false, loaded: true });
    dispatch('getBalances');
    dispatch('getAllowances');
    dispatch('loadPrices');
  },
  setTokenlist: ({ commit, dispatch }, name) => {
    lsSet('tokenlist', name);
    commit('REGISTRY_SET', { currentTokenlist: name });
    dispatch('getBalances');
    dispatch('getAllowances');
    dispatch('loadPrices');
  },
  injectTokens: async ({ commit, dispatch, rootState }, tokens) => {
    if (tokens.length === 0 || !isAddress(tokens[0])) return;
    const injected = clone(state.injected);
    const network = rootState.web3.network.key;
    const tokensMetadata = await getTokensMetadata(
      network,
      getProvider(network),
      tokens
    );
    Object.values(tokensMetadata).map((tokenMetadata: any) =>
      injected.push({ ...tokenMetadata, ...{ injected: true } })
    );
    commit('REGISTRY_SET', { injected });
    dispatch('getBalances', tokens);
    dispatch('getAllowances', { tokens });
    dispatch('loadPrices', tokens);
  }
};

const mutations = {
  REGISTRY_SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      Vue.set(_state, key, payload[key]);
    });
  }
};

export default {
  state,
  mutations,
  getters,
  actions
};
