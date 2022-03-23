import { Ref, computed } from 'vue';
import { getAddress } from 'ethers/lib/utils';

import {
  PoolType,
  AnyPool,
  PoolToken,
  FullPool
} from '@/services/balancer/subgraph/types';
import { configService } from '@/services/config/config.service';

import { bnum } from '@/lib/utils';

import { POOL_MIGRATIONS } from '@/components/forms/pool_actions/MigrateForm/constants';

import useNumbers from './useNumbers';
import { Network } from '@balancer-labs/sdk';
import { urlFor } from './useNetwork';

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

export function isMigratablePool(pool: AnyPool) {
  return POOL_MIGRATIONS.some(
    poolMigrationInfo => poolMigrationInfo.fromPoolId === pool.id
  );
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
 * @summary Orders pool token addresses by weight if weighted pool
 * @returns Array of checksum addresses
 */
export function orderedTokenAddresses(pool: AnyPool): string[] {
  const sortedTokens = orderedPoolTokens(
    pool.poolType,
    pool.address,
    pool.tokens
  );
  return sortedTokens.map(token => getAddress(token?.address || ''));
}

/**
 * @summary Orders pool tokens by weight if weighted pool
 */
export function orderedPoolTokens(
  poolType: PoolType,
  poolAddress: string,
  tokens: Pick<PoolToken, 'address' | 'weight'>[]
): Partial<PoolToken>[] {
  if (isStablePhantom(poolType))
    return tokens.filter(token => token.address !== poolAddress);
  if (isStableLike(poolType)) return tokens;

  return tokens
    .slice()
    .sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
}

/**
 * @summary returns full URL for pool id, given network.
 */
export function poolURLFor(poolId: string, network: Network): string {
  return `${urlFor(network)}/pool/${poolId}`;
}

/**
 * COMPOSABLE
 */
export function usePool(pool: Ref<AnyPool> | Ref<undefined>) {
  const { fNum2 } = useNumbers();

  /**
   * Returns pool weights label
   */
  function poolWeightsLabel(pool: FullPool): string {
    if (isStableLike(pool.poolType)) {
      return Object.values(pool.tokens)
        .map(token => token.symbol)
        .join(', ');
    }

    return Object.values(pool.onchain.tokens)
      .map(
        token =>
          `${fNum2(token.weight, {
            style: 'percent',
            maximumFractionDigits: 0
          })} ${token.symbol}`
      )
      .join(', ');
  }

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
    isMigratablePool,
    poolWeightsLabel,
    orderedTokenAddresses,
    orderedPoolTokens
  };
}
