import { Pool } from '@/utils/balancer/types';
import { getPool } from '@/utils/balancer/pools';
import { getPools, Pool as SubgraphPool } from '@/api/subgraph';
import getProvider from '@/utils/provider';

export interface PoolsState {
  current: Pool | null;
  all: SubgraphPool[];
}

const state: PoolsState = {
  current: null,
  all: []
};

const actions = {
  async get({ commit, rootState }, id: string): Promise<Pool> {
    const network = rootState.web3.config.key;
    const provider = getProvider(network);
    const pool = await getPool(network, provider, id);
    commit('setCurrent', pool);
    return pool;
  },

  async getAll({ commit, rootState }): Promise<SubgraphPool[]> {
    const network = rootState.web3.config.key;
    const pools = await getPools(network);
    commit('setAll', pools);
    return pools;
  }
};

const mutations = {
  setCurrent(_state: PoolsState, pool: Pool): void {
    _state.current = pool;
  },

  setAll(_state: PoolsState, pools: SubgraphPool[]): void {
    _state.all = pools;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
