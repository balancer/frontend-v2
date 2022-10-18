import { Network } from '@balancer-labs/sdk';
import { isAddress } from '@ethersproject/address';
import { getAddress } from 'ethers/lib/utils';
import { computed, Ref } from 'vue';

import { POOL_MIGRATIONS } from '@/components/forms/pool_actions/MigrateForm/constants';
import { POOLS } from '@/constants/pools';
import { bnum, includesAddress, isSameAddress } from '@/lib/utils';
import { includesWstEth } from '@/lib/utils/balancer/lido';
import { configService } from '@/services/config/config.service';
import { AnyPool, Pool, PoolAPRs, PoolToken } from '@/services/pool/types';
import { PoolType } from '@/services/pool/types';
import { hasBalEmissions } from '@/services/staking/utils';

import { isTestnet, urlFor } from './useNetwork';
import useNumbers, { FNumFormats, numF } from './useNumbers';

/**
 * METHODS
 */
export function addressFor(poolId: string): string {
  return getAddress(poolId.slice(0, 42));
}

export function isStable(poolType: PoolType): boolean {
  return poolType === PoolType.Stable;
}

export function isMetaStable(poolType: PoolType): boolean {
  return poolType === PoolType.MetaStable;
}

export function isStablePhantom(poolType: PoolType): boolean {
  return poolType === PoolType.StablePhantom;
}

export function isComposableStable(poolType: PoolType): boolean {
  return poolType === PoolType.ComposableStable;
}

export function isComposableStableLike(poolType: PoolType): boolean {
  return isStablePhantom(poolType) || isComposableStable(poolType);
}

export function isDeep(pool: Pool): boolean {
  const treatAsDeep = [
    '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f', // bb-a-USD1 (goerli)
    '0x3d5981bdd8d3e49eb7bbdc1d2b156a3ee019c18e0000000000000000000001a7', // bb-a-USD2 (goerli)
    '0x48e6b98ef6329f8f0a30ebb8c7c960330d64808500000000000000000000075b', // bb-am-USD (polygon)
    '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe', // bb-a-USD1 (mainnet)
    '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d', // bb-a-USD2 (mainnet)
  ];

  return treatAsDeep.includes(pool.id);
}

export function isShallowComposableStable(pool: Pool): boolean {
  return isComposableStable(pool.poolType) && !isDeep(pool);
}

export function isStableLike(poolType: PoolType): boolean {
  return (
    isStable(poolType) ||
    isMetaStable(poolType) ||
    isStablePhantom(poolType) ||
    isComposableStable(poolType)
  );
}

export function isUnknownType(poolType: any): boolean {
  return !Object.values(PoolType).includes(poolType);
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
  return includesAddress(
    pool.tokensList || [],
    configService.network.addresses.weth
  );
}

export function isMigratablePool(pool: AnyPool) {
  return POOL_MIGRATIONS.some(migration => migration.fromPoolId === pool.id);
}

export function noInitLiquidity(pool: AnyPool): boolean {
  return bnum(pool?.onchain?.totalSupply || '0').eq(0);
}

export function preMintedBptIndex(pool: Pool): number | void {
  return pool.tokens.findIndex(token => token.address === pool.address);
}

/**
 * @returns tokens that can be used to invest or withdraw from a pool
 */
export function lpTokensFor(pool: AnyPool): string[] {
  if (isDeep(pool)) {
    const mainTokens = pool.mainTokens || [];
    const wrappedTokens = pool.wrappedTokens || [];
    return [...mainTokens, ...wrappedTokens];
  } else {
    return pool.tokensList || [];
  }
}

/**
 * @summary Orders pool token addresses by weight if weighted pool
 * @returns Array of checksum addresses
 */
export function orderedTokenAddresses(pool: AnyPool): string[] {
  const sortedTokens = orderedPoolTokens(pool, pool.tokens);
  return sortedTokens.map(token => getAddress(token?.address || ''));
}

type TokenProperties = Pick<PoolToken, 'address' | 'weight'>;

/**
 * @summary Orders pool tokens by weight if weighted pool
 */
export function orderedPoolTokens<TPoolTokens extends TokenProperties>(
  pool: Pool,
  tokens: TPoolTokens[]
): TPoolTokens[] {
  if (isComposableStable(pool.poolType))
    return tokens.filter(token => !isSameAddress(token.address, pool.address));
  if (isStableLike(pool.poolType)) return tokens;
  return tokens
    .slice()
    .sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
}

/**
 * @summary returns full URL for pool id, given network.
 */
export function poolURLFor(
  poolId: string,
  network: Network,
  poolType?: string | PoolType
): string {
  if (network === Network.OPTIMISM) {
    return `https://op.beets.fi/#/pool/${poolId}`;
  }
  if (poolType && poolType.toString() === 'Element') {
    return `https://app.element.fi/pools/${addressFor(poolId)}`;
  }
  if (poolType && poolType.toString() === 'FX') {
    return `https://app.xave.finance/#/pool`;
  }

  return `${urlFor(network)}/pool/${poolId}`;
}

/**
 * @summary Calculates absolute max APR given boost or not.
 * If given boost returns user's max APR.
 * If not given boost returns pool absolute max assuming 2.5x boost.
 * Used primarily for sorting tables by the APR column.
 */
export function absMaxApr(aprs: PoolAPRs, boost?: string): string {
  if (boost) return aprs.total.staked.calc(boost);

  return aprs.total.staked.max;
}

/**
 * @summary Returns total APR label, whether range or single value.
 */
export function totalAprLabel(aprs: PoolAPRs, boost?: string): string {
  if (boost) {
    return numF(aprs.total.staked.calc(boost), FNumFormats.percent);
  } else if (hasBalEmissions(aprs)) {
    const minAPR = numF(aprs.total.staked.min, FNumFormats.percent);
    const maxAPR = numF(aprs.total.staked.max, FNumFormats.percent);
    return `${minAPR} - ${maxAPR}`;
  } else if (aprs.veBal) {
    const minAPR = numF(aprs.total.staked.min, FNumFormats.percent);
    const maxValue = bnum(aprs.total.staked.min).plus(aprs.veBal).toString();
    const maxAPR = numF(maxValue, FNumFormats.percent);
    return `${minAPR} - ${maxAPR}`;
  }

  return numF(aprs.total.staked.min, FNumFormats.percent);
}

/**
 * @summary Checks if given pool is BAL 80/20 pool (veBAL)
 */
export function isVeBalPool(poolId: string): boolean {
  return POOLS.IdsMap?.veBAL === poolId;
}

/**
 * @summary Remove pre-minted pool token address from tokensList
 */
export function removePreMintedBPT(pool: Pool): Pool {
  pool.tokensList = pool.tokensList.filter(
    address => !isSameAddress(address, pool.address)
  );
  return pool;
}

/**
 * @summary Check if pool should be accessible in UI
 */
export function isBlocked(pool: Pool, account: string): boolean {
  const requiresAllowlisting =
    isStableLike(pool.poolType) || isManaged(pool.poolType);
  const isOwnedByUser =
    isAddress(account) && isSameAddress(pool.owner, account);
  const isAllowlisted =
    POOLS.Stable.AllowList.includes(pool.id) ||
    POOLS.Investment.AllowList.includes(pool.id);

  return (
    !isTestnet.value && requiresAllowlisting && !isAllowlisted && !isOwnedByUser
  );
}

/**
 * Approximate BPT price using total liquidity calculated via Coingecko prices
 * and subgraph total shares. Cannot be relied on to be 100% accurate.
 *
 * @returns USD value of 1 BPT
 */
export function bptPriceFor(pool: Pool): string {
  return bnum(pool.totalLiquidity).div(pool.totalShares).toString();
}

/**
 * Calculate USD value of shares using approx. BPT price function.
 *
 * @returns USD value of shares.
 */
export function fiatValueOf(pool: Pool, shares: string): string {
  return bnum(shares).times(bptPriceFor(pool)).toString();
}

/**
 * COMPOSABLE
 */
export function usePool(pool: Ref<AnyPool> | Ref<undefined>) {
  const { fNum2 } = useNumbers();

  /**
   * Returns pool weights label
   */
  function poolWeightsLabel(pool: Pool): string {
    if (!pool?.onchain?.tokens) return '';

    if (isStableLike(pool.poolType)) {
      return Object.values(pool.onchain.tokens)
        .map(token => token.symbol)
        .join(', ');
    }

    return Object.values(pool.onchain.tokens)
      .map(
        token =>
          `${fNum2(token.weight, {
            style: 'percent',
            maximumFractionDigits: 0,
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
  const isComposableStablePool = computed(
    (): boolean => !!pool.value && isComposableStable(pool.value.poolType)
  );
  const isDeepPool = computed(
    (): boolean => !!pool.value && isDeep(pool.value)
  );
  const isShallowComposableStablePool = computed(
    (): boolean => isComposableStablePool.value && !isDeepPool.value
  );
  const isStableLikePool = computed(
    (): boolean => !!pool.value && isStableLike(pool.value.poolType)
  );
  const isComposableStableLikePool = computed(
    (): boolean => !!pool.value && isComposableStableLike(pool.value.poolType)
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
    (): boolean => !!pool.value && includesWstEth(pool.value.tokensList)
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
    isComposableStablePool,
    isStableLikePool,
    isComposableStableLikePool,
    isDeepPool,
    isShallowComposableStablePool,
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
    orderedPoolTokens,
  };
}
