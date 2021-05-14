import { getEtherPrice, getTokensPrice } from '@/api/coingecko';
import { ETHER } from '@/constants/tokenlists';
import { getGasPrice } from '@/lib/utils/balancer/gasPrices';

type Prices = Record<string, number>;

interface MarketState {
  prices: Prices;
  gasPrice: number;
  loading: boolean;
}

const state: MarketState = {
  prices: {},
  gasPrice: 0,
  loading: false
};

const actions = {
  async loadPrices({ commit, rootGetters }, tokens: string[] = []) {
    if (tokens.length === 0)
      tokens = Object.values(rootGetters['registry/getTokens']()).map(
        (token: any) => token.address
      );
    commit('setLoading', true);
    const chainId = Number(process.env.VUE_APP_NETWORK || 1);
    const [prices, etherPrice] = await Promise.all([
      getTokensPrice(chainId, tokens),
      getEtherPrice()
    ]);
    prices[ETHER.address.toLowerCase()] = etherPrice;
    commit('addPrices', prices);
    commit('setLoading', false);
  },
  async getGasPrice({ commit }) {
    const price = await getGasPrice();
    commit('setGasPrice', price);
  }
};

const mutations = {
  addPrices(_state: MarketState, prices: Prices) {
    for (const asset in prices) {
      _state.prices[asset] = prices[asset];
    }
  },

  setGasPrice(_state: MarketState, price: number) {
    _state.gasPrice = price;
  },

  setLoading(_state: MarketState, val: boolean) {
    _state.loading = val;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
