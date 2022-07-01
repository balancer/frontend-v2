import { Ref, ref } from 'vue';

import { Pool, PoolAPRs } from './types';

export interface ISinglePoolService {
  pools: Ref<Pool[] | null>;
}

export class SinglePoolService implements ISinglePoolService {
  public pools = ref<Pool[] | null>(null);
  public currentPool = ref<Pool | null>(null);
  public currentPoolAprs = ref<PoolAPRs | null>(null);

  public setPools(pools: Pool[]) {
    // console.log('pools', pools);
    this.pools.value = pools;
  }

  public setCurrentPool(pool: Pool) {
    this.currentPool.value = pool;
  }

  public setCurrentPoolAprs(poolAprs: PoolAPRs) {
    this.currentPoolAprs.value = poolAprs;
  }

  public findPool(id: string): Pool | void {
    return this.pools.value?.find(pool => pool.id === id);
  }
}

export const singlePoolService = new SinglePoolService();
