import { Pool } from '@/utils/balancer/types';
import { getPool } from '@/utils/balancer/pools';
import { getPools, Pool as SubgraphPool, PoolSnapshot } from '@/api/subgraph';
import getProvider from '@/utils/provider';

interface PoolData {
  pools: SubgraphPool[];
  snapshots: PoolSnapshot[];
}

export interface PoolsState {
  current: Pool | null;
  all: PoolData;
}

const state: PoolsState = {
  current: null,
  all: {
    pools: [],
    snapshots: []
  }
};

const actions = {
  async get({ commit }, id: string): Promise<Pool> {
    const network = process.env.VUE_APP_NETWORK || '1';
    const provider = getProvider(network);
    const pool = await getPool(network, provider, id);
    commit('setCurrent', pool);
    return pool;
  },

  async getAll({ commit }): Promise<PoolData> {
    const network = Number(process.env.VUE_APP_NETWORK || 1);
    const pools = await getPools({ chainId: network });
    commit('setAll', pools);
    return pools;
  }
};

const mutations = {
  setCurrent(_state: PoolsState, pool: Pool): void {
    _state.current = pool;
  },

  setAll(_state: PoolsState, pools: PoolData): void {
    _state.all = pools;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
