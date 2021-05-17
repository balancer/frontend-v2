import { lsGet, lsSet } from '@/lib/utils';
import initialTokens from '@/constants/initialTokens.json';

const NETWORK = process.env.VUE_APP_NETWORK || '1';

export interface TradeState {
  inputAsset: string;
  outputAsset: string;
}

const state: TradeState = {
  inputAsset: '',
  outputAsset: ''
};

const actions = {
  init({ commit }) {
    commit(
      'setInputAsset',
      lsGet('trade.inputAsset', initialTokens[NETWORK].input)
    );
    commit(
      'setOutputAsset',
      lsGet('trade.outputAsset', initialTokens[NETWORK].output)
    );
  }
};

const mutations = {
  setInputAsset(state: TradeState, asset: string): void {
    state.inputAsset = asset;
    lsSet('trade.inputAsset', asset);
  },

  setOutputAsset(state: TradeState, asset: string): void {
    state.outputAsset = asset;
    lsSet('trade.outputAsset', asset);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
