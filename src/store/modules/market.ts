import GasPriceService from '@/services/gas-price/gas-price.service';

interface MarketState {
  gasPrice: number;
  loading: boolean;
}

const gasPriceService = new GasPriceService();

const state: MarketState = {
  gasPrice: 0,
  loading: false
};

const actions = {
  async getGasPrice({ commit }) {
    const gasPrice = await gasPriceService.getLatest();
    commit('setGasPrice', gasPrice?.price);
  }
};

const mutations = {
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
