import { gasPriceService } from '@/services/gas-price/gas-price.service';

/**
 * TODO - Remoev this, I don't think we need it anymore.
 */

interface MarketState {
  gasPrice: number;
  loading: boolean;
}

const state: MarketState = {
  gasPrice: 0,
  loading: false,
};

const actions = {
  async getGasPrice({ commit }) {
    const gasPrice = await gasPriceService.getGasPrice();
    commit('setGasPrice', gasPrice?.price);
  },
};

const mutations = {
  setGasPrice(_state: MarketState, price: number) {
    _state.gasPrice = price;
  },

  setLoading(_state: MarketState, val: boolean) {
    _state.loading = val;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
