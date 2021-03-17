import { Pool } from '@/utils/balancer/types';
import { getPool } from '@/utils/balancer/pools';
import getProvider from '@/utils/provider';

export interface PoolsState {
  current: Pool | null;
}

const state: PoolsState = {
  current: null
};

const mutations = {
  setCurrent(state, pool: Pool): void {
    state.current = pool;
  }
};

const actions = {
  async loadPool({ commit, rootState }, id: string): Promise<Pool> {
    const network = rootState.web3.config.key;
    const provider = getProvider(network);
    const pool = await getPool(network, provider, id);
    commit('setCurrent', pool);
    return pool;
  }
};

export default {
  state,
  mutations,
  actions
};
