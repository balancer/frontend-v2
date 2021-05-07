import { formatUnits } from '@ethersproject/units';
import { getAddress, isAddress } from '@ethersproject/address';
import orderBy from 'lodash/orderBy';
import { loadTokenlist } from '@/utils/tokenlists';
import { ETHER, TOKEN_LIST_DEFAULT, TOKEN_LISTS } from '@/constants/tokenlists';
import { clone, lsGet, lsSet } from '@/utils';
import injected from '@/constants/injected.json';
import { TokenList, TokenInfo } from '@/types/TokenList';
import { getTokensMeta } from '@/utils/balancer/tokens';

const defaultActiveLists = {};
defaultActiveLists[TOKEN_LIST_DEFAULT] = true;

interface RegistryState {
  activeLists: Record<string, boolean>;
  tokenLists: Record<string, TokenList | {}>;
  injected: TokenInfo[];
  loading: boolean;
}

const state: RegistryState = {
  activeLists: lsGet('tokenLists', defaultActiveLists),
  tokenLists: Object.fromEntries(TOKEN_LISTS.map(tokenList => [tokenList, {}])),
  injected,
  loading: true
};

const getters = {
  getEther: (state, getters, rootState) => () => {
    const ether: any = ETHER;
    ether.balance = 0;
    ether.balanceDenorm = '0';
    ether.price =
      rootState.market.prices[ether.address.toLowerCase()]?.price || 0;
    ether.price24HChange =
      rootState.market.prices[ether.address.toLowerCase()]?.price24HChange || 0;
    if (rootState.web3.account) {
      ether.balanceDenorm = rootState.account.balances.ether || '0';
      ether.balance = formatUnits(ether.balanceDenorm, ether.decimals);
      ether.value = ether.balance * ether.price;
      ether.value24HChange =
        (parseFloat(ether.value) / 100) * ether.price24HChange;
    }
    return ether;
  },

  getTokens: (state, getters, rootState) => (query: any = {}) => {
    const { q, addresses, not, withBalance, limit, includeEther } = query;

    const activeLists = Object.keys(state.tokenLists)
      .filter(name => state.activeLists[name])
      .reverse();

    let tokens: any = {};
    clone(state.injected).forEach(
      token => (tokens[getAddress(token.address)] = token)
    );
    activeLists.forEach(name => {
      clone(state.tokenLists[name])?.tokens?.map(
        token => (tokens[getAddress(token.address)] = token)
      );
    });
    tokens = Object.values(tokens);

    tokens = tokens.filter(
      token => token.chainId === Number(process.env.VUE_APP_NETWORK || 1)
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
        token.balanceDenorm = rootState.account.balances[address] || '0';
        token.balance = formatUnits(token.balanceDenorm, token.decimals);
        token.value = token.balance * token.price;
        token.value24HChange =
          (parseFloat(token.value) / 100) * token.price24HChange;
        return token;
      });
      tokens = orderBy(tokens, ['value', 'balance'], ['desc', 'desc']);
    }

    // Query filters

    if (includeEther) {
      tokens = [getters.getEther(), ...tokens];
    }

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

  getTokenLists: (state, getters, rootState) => ({ q, active }) => {
    const tokenLists = clone(state.tokenLists);
    return Object.fromEntries(
      Object.entries(tokenLists)
        .map((tokenList: any) => {
          tokenList[1].tokens = tokenList[1].tokens
            ? tokenList[1].tokens.filter(
                token => token.chainId === rootState.web3.config.chainId
              )
            : [];
          tokenList[1].active = state.activeLists[tokenList[0]] ? 1 : 0;
          return tokenList;
        })
        .filter(
          tokenList =>
            tokenList[1].tokens.length > 0 &&
            (!active || (active && tokenList[1].active))
        )
        .filter(tokenList =>
          q
            ? `${tokenList[0]} ${tokenList[1].name}`
                .toLowerCase()
                .includes(q.toLowerCase())
            : true
        )
        .sort((a, b): any => b[1].active - a[1].active)
    );
  }
};

const actions = {
  async get({ dispatch, commit }) {
    const loadAllLists = TOKEN_LISTS.map(name =>
      dispatch('loadTokenlist', name)
    );
    const results = await Promise.all(loadAllLists.map(p => p.catch(e => e)));
    const validResults = results.filter(result => !(result instanceof Error));
    if (validResults.length === 0) {
      throw new Error('Failed to load any TokenLists');
    }
    commit('setLoading', false);
  },

  async loadTokenlist({ commit }, name) {
    name = name || TOKEN_LIST_DEFAULT;
    try {
      const tokenList = await loadTokenlist(name);
      const tokenLists = clone(state.tokenLists);
      tokenLists[name] = tokenList;
      commit('setTokenLists', tokenLists);
    } catch (error) {
      console.error('Failed to load TokenList', name, error);
      throw error;
    }
  },

  async injectTokens({ commit, dispatch, state }, tokens: string[]) {
    tokens = tokens.filter(
      token => token !== ETHER.address && isAddress(token)
    );
    if (tokens.length === 0) return;
    const injected = clone(state.injected);
    const tokensMeta = await getTokensMeta(tokens, state.tokenLists);
    Object.values(tokensMeta).forEach((meta: TokenInfo) => {
      if (meta) injected.push({ ...meta, injected: true });
    });
    commit('setInjected', injected);
    dispatch('account/getBalances', null, { root: true });
    dispatch('account/getAllowances', { tokens }, { root: true });
    dispatch('market/loadPrices', tokens, { root: true });
  },

  toggleList({ commit }, name) {
    const activeLists = clone(state.activeLists);
    if (activeLists[name]) {
      delete activeLists[name];
    } else {
      activeLists[name] = true;
    }
    if (Object.keys(activeLists).length > 0) {
      lsSet('tokenLists', activeLists);
      commit('setActiveLists', activeLists);
    }
  }
};

const mutations = {
  setLoading(_state: RegistryState, val: boolean): void {
    _state.loading = val;
  },

  setTokenLists(
    _state: RegistryState,
    tokenLists: Record<string, TokenList[]>
  ): void {
    _state.tokenLists = tokenLists;
  },

  setInjected(_state: RegistryState, injected: TokenInfo[]): void {
    _state.injected = injected;
  },

  setActiveLists(
    _state: RegistryState,
    activeLists: Record<string, boolean>
  ): void {
    _state.activeLists = activeLists;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
};
