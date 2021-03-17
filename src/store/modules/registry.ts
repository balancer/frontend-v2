import { formatUnits } from '@ethersproject/units';
import { getAddress, isAddress } from '@ethersproject/address';
import getProvider from '@/utils/provider';
import orderBy from 'lodash/orderBy';
import BN from 'bn.js';
import { loadTokenlist } from '@/utils/tokenlists';
import { ETHER, TOKEN_LIST_DEFAULT, TOKEN_LISTS } from '@/constants/tokenlists';
import { clone, lsGet, lsSet } from '@/utils';
import { getTokensMetadata } from '@/utils/balancer/tokens';

const defaultActiveLists = {};
defaultActiveLists[TOKEN_LIST_DEFAULT] = true;

const state = {
  activeLists: lsGet('tokenlists', defaultActiveLists),
  currentTokenlist: TOKEN_LIST_DEFAULT,
  tokenlists: Object.fromEntries(TOKEN_LISTS.map(tokenlist => [tokenlist, {}])),
  injected: [],
  loading: false,
  loaded: false
};

const getters = {
  getEther: (state, getters, rootState) => () => {
    const ether: any = ETHER;
    ether.balance = 0;
    ether.balanceDenorm = '0';
    ether.price = rootState.market.prices?.ether?.price || 0;
    ether.price24HChange = rootState.market.prices?.ether?.price24HChange || 0;
    if (rootState.web3.account) {
      ether.balanceDenorm = rootState.account.balances.ether || new BN(0);
      ether.balance = formatUnits(ether.balanceDenorm, ether.decimals);
      ether.value = ether.balance * ether.price;
      ether.value24HChange =
        (parseFloat(ether.value) / 100) * ether.price24HChange;
    }
    return ether;
  },
  getTokens: (state, getters, rootState) => (query: any = {}) => {
    const { q, addresses, not, withBalance, limit } = query;

    const activeLists = Object.keys(state.tokenlists)
      .filter(name => state.activeLists[name])
      .reverse();

    let tokens: any = {};
    clone(state.injected).forEach(
      token => (tokens[getAddress(token.address)] = token)
    );
    activeLists.forEach(name => {
      clone(state.tokenlists[name])?.tokens?.map(
        token => (tokens[getAddress(token.address)] = token)
      );
    });
    tokens = Object.values(tokens);

    tokens = tokens.filter(
      token => token.chainId === rootState.web3.config.chainId
    );

    tokens = tokens.map(token => {
      token.balance = 0;
      token.balanceDenorm = '0';
      return token;
    });

    tokens = tokens.map(token => {
      const address = token.address.toLowerCase();
      token.price = rootState.market.prices[address]?.price || 0;
      token.price24HChange =
        rootState.market.prices[address]?.price24HChange || 0;
      return token;
    });

    if (rootState.web3.account) {
      tokens = tokens.map(token => {
        const address = token.address.toLowerCase();
        token.balanceDenorm = rootState.account.balances[address] || new BN(0);
        token.balance = formatUnits(token.balanceDenorm, token.decimals);
        token.value = token.balance * token.price;
        token.value24HChange =
          (parseFloat(token.value) / 100) * token.price24HChange;
        return token;
      });
      tokens = orderBy(tokens, ['value', 'balance'], ['desc', 'desc']);
    }

    // Query filters

    if (q) {
      tokens = tokens.filter(token =>
        JSON.stringify([token.address, token.symbol, token.name])
          .toLowerCase()
          .includes(q.toLowerCase())
      );
    }

    if (addresses) {
      tokens = addresses.map(
        (address: any) =>
          tokens.filter(
            token => token.address.toLowerCase() === address.toLowerCase()
          )[0]
      );
    }

    if (limit) {
      tokens = tokens.slice(0, limit);
    }

    if (not) tokens = tokens.filter(token => !not.includes(token.address));
    if (withBalance) tokens = tokens.filter(token => token.balance > 0);

    return Object.fromEntries(tokens.map(token => [token.address, token]));
  },
  getTokenlists: (state, getters, rootState) => ({ q, active }) => {
    const tokenlists = clone(state.tokenlists);
    return Object.fromEntries(
      Object.entries(tokenlists)
        .map((tokenlist: any) => {
          tokenlist[1].tokens = tokenlist[1].tokens
            ? tokenlist[1].tokens.filter(
                token => token.chainId === rootState.web3.config.chainId
              )
            : [];
          tokenlist[1].active = state.activeLists[tokenlist[0]] ? 1 : 0;
          return tokenlist;
        })
        .filter(
          tokenlist =>
            tokenlist[1].tokens.length > 0 &&
            (!active || (active && tokenlist[1].active))
        )
        .filter(tokenlist =>
          q
            ? `${tokenlist[0]} ${tokenlist[1].name}`
                .toLowerCase()
                .includes(q.toLowerCase())
            : true
        )
        .sort((a, b): any => b[1].active - a[1].active)
    );
  }
};

const actions = {
  loadRegistry: async ({ dispatch, commit }) => {
    commit('REGISTRY_SET', { loading: true });
    await Promise.all(TOKEN_LISTS.map(name => dispatch('loadTokenlist', name)));
    commit('REGISTRY_SET', { loading: false, loaded: true });
    dispatch('getBalances');
    dispatch('getAllowances');
    dispatch('loadPrices');
  },
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
  injectTokens: async ({ commit, dispatch, rootState }, tokens) => {
    if (tokens.length === 0 || !isAddress(tokens[0])) return;
    const injected = clone(state.injected);
    const network = rootState.web3.config.key;
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
  },
  toggleList: ({ commit }, name) => {
    const activeLists = clone(state.activeLists);
    if (activeLists[name]) {
      delete activeLists[name];
    } else {
      activeLists[name] = true;
    }
    if (Object.keys(activeLists).length > 0) {
      lsSet('tokenlists', activeLists);
      commit('REGISTRY_SET', { activeLists });
    }
  }
};

const mutations = {
  REGISTRY_SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      _state[key] = payload[key];
    });
  }
};

export default {
  state,
  mutations,
  getters,
  actions
};
