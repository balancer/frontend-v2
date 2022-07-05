import { Ref, ref } from 'vue';

import { Pool } from './types';

export interface ISinglePoolService {
  pools: Ref<Pool[] | null>;
}

export class SinglePoolService implements ISinglePoolService {
  public pools = ref<Pool[] | null>(null);

  public setPools(pools: Pool[]): void {
    this.pools.value = pools;
  }

  public findPool(id: string): Pool | void {
    return this.pools.value?.find(pool => pool.id === id);
  }
}

export const singlePoolService = new SinglePoolService();
