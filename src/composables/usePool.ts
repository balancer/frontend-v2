import { Ref, computed } from 'vue';
import {
  PoolType,
  AnyPool,
  FullPool
} from '@/services/balancer/subgraph/types';
import { configService } from '@/services/config/config.service';
import { getAddress } from 'ethers/lib/utils';
import { bnum } from '@/lib/utils';
import { fNum } from './useNumbers';
import { isMainnet } from './useNetwork';

/**
 * METHODS
 */
export function isStable(poolType: PoolType): boolean {
  return poolType === PoolType.Stable;
}

export function isMetaStable(poolType: PoolType): boolean {
  return poolType === PoolType.MetaStable;
}

export function isStablePhantom(poolType: PoolType): boolean {
  return poolType === PoolType.StablePhantom;
}

export function isStableLike(poolType: PoolType): boolean {
  return (
    isStable(poolType) || isMetaStable(poolType) || isStablePhantom(poolType)
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

export function isStaBAL3(pool: AnyPool): boolean {
  if (isMainnet) {
    return pool.id === configService.network.pools.staBAL3;
  }

  return false;
}

export function isMigratablePool(pool: AnyPool) {
  return isStaBAL3(pool);
}

export function noInitLiquidity(pool: AnyPool): boolean {
  return bnum(pool?.onchain?.totalSupply || '0').eq(0);
}

/**
 * @returns tokens that can be used to invest or withdraw from a pool
 */
export function lpTokensFor(pool: AnyPool): string[] {
  if (isStablePhantom(pool.poolType)) {
    const mainTokens = pool.mainTokens || [];
    const wrappedTokens = pool.wrappedTokens || [];
    return [...mainTokens, ...wrappedTokens];
  } else {
    return pool.tokenAddresses || [];
  }
}

/**
 * Returns pool weights label
 */
export function poolWeightsLabel(pool: FullPool): string {
  if (isStableLike(pool.poolType)) {
    return Object.values(pool.onchain.tokens)
      .map(token => token.symbol)
      .join(', ');
  }

  return Object.values(pool.onchain.tokens)
    .map(token => `${fNum(token.weight, 'percent_lg')} ${token.symbol}`)
    .join(', ');
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
  const isStablePhantomPool = computed(
    (): boolean => !!pool.value && isStablePhantom(pool.value.poolType)
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
      !!pool.value && isManagedPool.value && !pool.value.onchain?.swapEnabled
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

  const lpTokens = computed(() => {
    if (!pool.value) return [];

    return lpTokensFor(pool.value);
  });

  return {
    // computed
    isStablePool,
    isMetaStablePool,
    isStablePhantomPool,
    isStableLikePool,
    isWeightedPool,
    isWeightedLikePool,
    isManagedPool,
    isLiquidityBootstrappingPool,
    managedPoolWithTradingHalted,
    isWethPool,
    isWstETHPool,
    noInitLiquidityPool,
    lpTokens,
    // methods
    isStable,
    isMetaStable,
    isStablePhantom,
    isStableLike,
    isWeighted,
    isLiquidityBootstrapping,
    isWeightedLike,
    isTradingHaltable,
    isWeth,
    noInitLiquidity,
    lpTokensFor,
    isMigratablePool
  };
}
