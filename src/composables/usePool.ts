import { Ref, computed } from 'vue';
import {
  Pool,
  DecoratedPoolWithShares,
  FullPool,
  PoolType
} from '@/services/balancer/subgraph/types';
import { TOKENS } from '@/constants/tokens';

type AnyPool = Pool | FullPool | DecoratedPoolWithShares;

export function isStable(pool: AnyPool): boolean {
  return pool.poolType === PoolType.Stable;
}

export function isWeighted(pool: AnyPool): boolean {
  return pool.poolType === PoolType.Weighted;
}

export function isWeth(pool: AnyPool): boolean {
  return pool.tokenAddresses.includes(TOKENS.AddressMap.WETH);
}

export function usePool(pool: Ref<AnyPool>) {
  const isStablePool = computed(() => isStable(pool.value));
  const isWeightedPool = computed(() => isWeighted(pool.value));
  const isWethPool = computed(() => isWeth(pool.value));

  return {
    // computed
    isStablePool,
    isWeightedPool,
    isWethPool,
    // methods
    isStable,
    isWeighted,
    isWeth
  };
}
