import { Pool } from '@/services/balancer/subgraph/types';
import usePools from '@/composables/pools/usePools';

export interface PoolsState {
  current: Pool | null;
  all: Pool[];
}

const state: PoolsState = {
  current: null,
  all: []
};

const actions = {
  async get({ commit }, id: string): Promise<Pool> {
    const { pools } = usePools();
    const pool = pools.value.find(pool => pool.id === id) || pools.value[0];
    commit('setCurrent', pool);
    return pool;
  },

  async getAll({ commit }): Promise<Pool[]> {
    const { pools } = usePools();
    commit('setAll', pools);
    return pools.value;
  }
};

const mutations = {
  setCurrent(_state: PoolsState, pool: Pool): void {
    _state.current = pool;
  },

  setAll(_state: PoolsState, pools: Pool[]): void {
    _state.all = pools;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
