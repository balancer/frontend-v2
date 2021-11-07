import { Ref, computed } from 'vue';
import { PoolType, AnyPool } from '@/services/balancer/subgraph/types';
import { configService } from '@/services/config/config.service';
import { getAddress } from 'ethers/lib/utils';
import { bnum } from '@/lib/utils';
import { TOKENS } from '@/constants/tokens';

/**
 * METHODS
 */
export function isStable(poolType: PoolType): boolean {
  return poolType === PoolType.Stable;
}

export function isMetaStable(poolType: PoolType): boolean {
  return poolType === PoolType.MetaStable;
}

export function isPhantomStable(poolType: PoolType): boolean {
  return poolType === PoolType.StablePhantom;
}

export function isStableLike(poolType: PoolType): boolean {
  return (
    isStable(poolType) || isMetaStable(poolType) || isPhantomStable(poolType)
  );
}

export function isLiquidityBootstrapping(poolType: PoolType): boolean {
  return poolType === PoolType.LiquidityBootstrapping;
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

export function noInitLiquidity(pool: AnyPool): boolean {
  return bnum(pool?.onchain?.totalSupply || '0').eq(0);
}

export function investableTokensFor(pool: AnyPool): string[] {
  if (isPhantomStable(pool.poolType)) {
    return TOKENS.Investable[pool.id].Tokens || [];
  } else {
    return pool.tokenAddresses || [];
  }
}

/**
 * COMPOSABLE
 */
export function usePool(pool: Ref<AnyPool> | Ref<undefined>) {
  /**
   * COMPUTED
   */
  const isStablePool = computed(
    (): boolean => !!pool.value && isStable(pool.value.poolType)
  );
  const isMetaStablePool = computed(
    (): boolean => !!pool.value && isMetaStable(pool.value.poolType)
  );
  const isPhantomStablePool = computed(
    (): boolean => !!pool.value && isPhantomStable(pool.value.poolType)
  );
  const isStableLikePool = computed(
    (): boolean => !!pool.value && isStableLike(pool.value.poolType)
  );
  const isWeightedPool = computed(
    (): boolean => !!pool.value && isWeighted(pool.value.poolType)
  );
  const isWeightedLikePool = computed(
    (): boolean => !!pool.value && isWeightedLike(pool.value.poolType)
  );
  const isManagedPool = computed(
    (): boolean => !!pool.value && isManaged(pool.value.poolType)
  );
  const isLiquidityBootstrappingPool = computed(
    (): boolean => !!pool.value && isLiquidityBootstrapping(pool.value.poolType)
  );
  const managedPoolWithTradingHalted = computed(
    (): boolean =>
      !!pool.value && isManagedPool.value && !!pool.value.onchain?.swapEnabled
  );
  const isWethPool = computed(
    (): boolean => !!pool.value && isWeth(pool.value)
  );
  const isWstETHPool = computed(
    (): boolean => !!pool.value && isWstETH(pool.value)
  );
  const noInitLiquidityPool = computed(
    () => !!pool.value && noInitLiquidity(pool.value)
  );

  const investableTokens = computed(() => {
    if (!pool.value) return [];

    return investableTokensFor(pool.value);
  });

  return {
    // computed
    isStablePool,
    isMetaStablePool,
    isPhantomStablePool,
    isStableLikePool,
    isWeightedPool,
    isWeightedLikePool,
    isManagedPool,
    isLiquidityBootstrappingPool,
    managedPoolWithTradingHalted,
    isWethPool,
    isWstETHPool,
    noInitLiquidityPool,
    investableTokens,
    // methods
    isStable,
    isMetaStable,
    isPhantomStable,
    isStableLike,
    isWeighted,
    isLiquidityBootstrapping,
    isWeightedLike,
    isTradingHaltable,
    isWeth,
    noInitLiquidity,
    investableTokensFor
  };
}
