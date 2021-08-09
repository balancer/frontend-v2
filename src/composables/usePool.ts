import { Ref, computed } from 'vue';
import { getAddress } from 'ethers/lib/utils';
import {
  Pool,
  DecoratedPoolWithShares,
  FullPool,
  PoolType
} from '@/services/balancer/subgraph/types';
import { configService } from '@/services/config/config.service';

type AnyPool = Pool | FullPool | DecoratedPoolWithShares;

export function isStable(pool: AnyPool): boolean {
  return pool.poolType === PoolType.Stable;
}

export function isWeighted(pool: AnyPool): boolean {
  return pool.poolType === PoolType.Weighted;
}

export function isWeth(pool: AnyPool): boolean {
  return pool.tokenAddresses.includes(
    getAddress(configService.network.addresses.weth)
  );
}
export function isStETH(pool: AnyPool): boolean {
  return pool.tokenAddresses.includes(
    getAddress(configService.network.addresses.stETH)
  );
}

export function usePool(pool: Ref<AnyPool>) {
  const isStablePool = computed(() => isStable(pool.value));
  const isWeightedPool = computed(() => isWeighted(pool.value));
  const isWethPool = computed(() => isWeth(pool.value));
  const isStETHPool = computed(() => isStETH(pool.value));

  return {
    // computed
    isStablePool,
    isWeightedPool,
    isWethPool,
    isStETHPool,
    // methods
    isStable,
    isWeighted,
    isWeth
  };
}
