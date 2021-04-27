import { isBudgetLeft } from '@/utils/balancer/bal4gas';

export interface BalForGasState {
  isBudgetLeft: boolean;
}

const mutations = {
  setIsBudget: (_state: BalForGasState, isBudgetLeft: boolean): void => {
    _state.isBudgetLeft = isBudgetLeft;
  }
};

const actions = {
  async fetchBalForGasBudget({ commit }): Promise<void> {
    const budgetLeft = await isBudgetLeft();
    console.log(budgetLeft);
    commit('setIsBudget', budgetLeft);
  }
};

const state: BalForGasState = {
  isBudgetLeft: false
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
