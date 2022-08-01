import { networkId } from '@/composables/useNetwork';
import initialTokens from '@/constants/initialTokens.json';
import { lsGet, lsSet } from '@/lib/utils';

export interface TradeState {
  inputAsset: string;
  outputAsset: string;
}

const state: TradeState = {
  inputAsset: '',
  outputAsset: '',
};

const actions = {
  init({ commit }) {
    commit(
      'setInputAsset',
      lsGet('trade.inputAsset', initialTokens[networkId.value].input)
    );
    commit(
      'setOutputAsset',
      lsGet('trade.outputAsset', initialTokens[networkId.value].output)
    );
  },
};

const mutations = {
  setInputAsset(state: TradeState, asset: string): void {
    state.inputAsset = asset;
    lsSet('trade.inputAsset', asset);
  },

  setOutputAsset(state: TradeState, asset: string): void {
    state.outputAsset = asset;
    lsSet('trade.outputAsset', asset);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
