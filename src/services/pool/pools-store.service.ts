import { Ref, ref } from 'vue';

import { Pool } from './types';

export interface IPoolsStoreService {
  pools: Ref<Pool[] | null>;
  setPools(pools: Pool[]): void;
  findPool(id: string): Pool | void;
}

export class PoolsStoreService implements IPoolsStoreService {
  public pools = ref<Pool[] | null>(null);

  public setPools(pools: Pool[]): void {
    this.pools.value = pools;
  }

  public findPool(id: string): Pool | void {
    return this.pools.value?.find(pool => pool.id === id);
  }
}

export const poolsStoreService = new PoolsStoreService();
