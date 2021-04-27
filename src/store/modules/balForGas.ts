import { isBudgetLeft } from '@/utils/balancer/bal4gas';

export interface Bal4GasState {
  isBudgetLeft: boolean;
}

const mutations = {
  setIsBudget: (_state: Bal4GasState, isBudgetLeft: boolean): void => {
    _state.isBudgetLeft = isBudgetLeft;
  }
};

const actions = {
  async fetchBal4Gas({ commit }): Promise<void> {
    const budgetLeft = await isBudgetLeft();
    console.log(budgetLeft);
    commit('setIsBudget', budgetLeft);
  }
};

const state: Bal4GasState = {
  isBudgetLeft: false
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
