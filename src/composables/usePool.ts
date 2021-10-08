import { Ref, computed } from 'vue';
import { PoolType, AnyPool } from '@/services/balancer/subgraph/types';
import { configService } from '@/services/config/config.service';
import { getAddress } from 'ethers/lib/utils';

export function isStable(poolType: PoolType): boolean {
  return poolType === PoolType.Stable;
}

export function isMetaStable(poolType: PoolType): boolean {
  return poolType === PoolType.MetaStable;
}

export function isLiquidityBootstrapping(poolType: PoolType): boolean {
  return poolType === PoolType.LiquidityBootstrapping;
}

export function isStableLike(poolType: PoolType): boolean {
  return isStable(poolType) || isMetaStable(poolType);
}

export function isWeighted(poolType: PoolType): boolean {
  return poolType === PoolType.Weighted;
}

export function isManaged(poolType: PoolType): boolean {
  // Correct terminology is managed pools but subgraph still returns poolType = "Investment"
  return poolType === PoolType.Investment;
}

export function isWeightedLike(poolType: PoolType): boolean {
  return (
    isWeighted(poolType) ||
    isManaged(poolType) ||
    isLiquidityBootstrapping(poolType)
  );
}

export function isTradingHaltable(poolType: PoolType): boolean {
  return isManaged(poolType) || isLiquidityBootstrapping(poolType);
}

export function isWeth(pool: AnyPool): boolean {
  return pool.tokenAddresses.includes(configService.network.addresses.weth);
}

export function isWstETH(pool: AnyPool): boolean {
  if (!configService.network.addresses.wstETH) return false;

  return pool.tokenAddresses.includes(
    getAddress(configService.network.addresses.wstETH)
  );
}

export function usePool(pool: Ref<AnyPool> | Ref<undefined>) {
  const isStablePool = computed(
    () => pool.value && isStable(pool.value.poolType)
  );
  const isMetaStablePool = computed(
    () => pool.value && isMetaStable(pool.value.poolType)
  );
  const isStableLikePool = computed(
    () => pool.value && isStableLike(pool.value.poolType)
  );
  const isWeightedPool = computed(
    () => pool.value && isWeighted(pool.value.poolType)
  );
  const isWeightedLikePool = computed(
    () => pool.value && isWeightedLike(pool.value.poolType)
  );
  const isManagedPool = computed(
    () => pool.value && isManaged(pool.value.poolType)
  );
  const isLiquidityBootstrappingPool = computed(
    () => pool.value && isLiquidityBootstrapping(pool.value.poolType)
  );

  const managedPoolWithTradingHalted = computed(
    () => pool.value && isManagedPool.value && pool.value.onchain?.swapEnabled
  );

  const isWethPool = computed(() => pool.value && isWeth(pool.value));
  const isWstETHPool = computed(() => pool.value && isWstETH(pool.value));

  return {
    // computed
    isStablePool,
    isMetaStablePool,
    isStableLikePool,
    isWeightedPool,
    isWeightedLikePool,
    isManagedPool,
    isLiquidityBootstrappingPool,
    managedPoolWithTradingHalted,
    isWethPool,
    isWstETHPool,
    // methods
    isStable,
    isMetaStable,
    isStableLike,
    isWeighted,
    isLiquidityBootstrapping,
    isWeightedLike,
    isTradingHaltable,
    isWeth
  };
}
