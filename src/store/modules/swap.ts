import initialTokens from '@/constants/initialTokens.json';
import { lsGet, lsSet } from '@/lib/utils';

export interface SwapState {
  inputAsset: string;
  outputAsset: string;
}

const state: SwapState = {
  inputAsset: '',
  outputAsset: '',
};

const actions = {
  init({ commit }) {
    commit(
      'setInputAsset',
      lsGet(`swap.inputAsset.${1}`, initialTokens[1].input)
    );
    commit(
      'setOutputAsset',
      lsGet(`swap.outputAsset.${1}`, initialTokens[1].output)
    );
  },
};

const mutations = {
  setInputAsset(state: SwapState, asset: string): void {
    state.inputAsset = asset;
    lsSet(`swap.inputAsset.${1}`, asset);
  },

  setOutputAsset(state: SwapState, asset: string): void {
    state.outputAsset = asset;
    lsSet(`swap.outputAsset.${1}`, asset);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
