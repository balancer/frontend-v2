import { networkId } from '@/composables/useNetwork';
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
      lsGet(
        `swap.inputAsset.${networkId.value}`,
        initialTokens[networkId.value].input
      )
    );
    commit(
      'setOutputAsset',
      lsGet(
        `swap.outputAsset.${networkId.value}`,
        initialTokens[networkId.value].output
      )
    );
  },
};

const mutations = {
  setInputAsset(state: SwapState, asset: string): void {
    state.inputAsset = asset;
    lsSet(`swap.inputAsset.${networkId.value}`, asset);
  },

  setOutputAsset(state: SwapState, asset: string): void {
    state.outputAsset = asset;
    lsSet(`swap.outputAsset.${networkId.value}`, asset);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
