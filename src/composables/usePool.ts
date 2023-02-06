import { Network, AprBreakdown, PoolType } from '@balancer-labs/sdk';
import { isAddress, getAddress } from '@ethersproject/address';
import { computed, Ref } from 'vue';

import { POOL_MIGRATIONS } from '@/components/forms/pool_actions/MigrateForm/constants';
import { ALLOWED_RATE_PROVIDERS } from '@/constants/rateProviders';
import { POOLS } from '@/constants/pools';
import {
  bnum,
  includesAddress,
  isSameAddress,
  removeAddress,
} from '@/lib/utils';
import { includesWstEth } from '@/lib/utils/balancer/lido';
import { configService } from '@/services/config/config.service';

import {
  isTestnet,
  isMainnet,
  appUrl,
  getNetworkSlug,
  isL2,
} from './useNetwork';
import useNumbers, { FNumFormats, numF } from './useNumbers';
import { AnyPool, Pool, PoolToken, SubPool } from '@/services/pool/types';
import { hasBalEmissions } from '@/services/staking/utils';
import { uniq, uniqWith, cloneDeep } from 'lodash';

/**
 * METHODS
 */
export function addressFor(poolId: string): string {
  return getAddress(poolId.slice(0, 42));
}

export function isLinear(poolType: PoolType): boolean {
  return (
    poolType === PoolType.AaveLinear || poolType === PoolType.ERC4626Linear
  );
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

export function isPreMintedBptType(poolType: PoolType): boolean {
  // Currently equivalent to isComposableStableLike but will be extended later
  // with managed and composable weighted pools.
  return isStablePhantom(poolType) || isComposableStable(poolType);
}

/**
 * Checks if the pool is to be considered 'deep'. Deep pools are pools that the
 * UI treats differently because it understands that it contains nested pools.
 * This is used to enable the generalised deep pool join/exit flow for example.
 */
export function isDeep(pool: Pool): boolean {
  const treatAsDeep = [
    '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f', // bb-a-USD1 (goerli)
    '0x3d5981bdd8d3e49eb7bbdc1d2b156a3ee019c18e0000000000000000000001a7', // bb-a-USD2 (goerli)
    '0x48e6b98ef6329f8f0a30ebb8c7c960330d64808500000000000000000000075b', // bb-am-USD (polygon)
    '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe', // bb-a-USD1 (mainnet)
    '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d', // bb-a-USD2 (mainnet)
    '0x3d5981bdd8d3e49eb7bbdc1d2b156a3ee019c18e0000000000000000000001a7', // bb-a-USD2 (goerli)
    '0x25accb7943fd73dda5e23ba6329085a3c24bfb6a000200000000000000000387', // wstETH/bb-a-USD (mainnet)
    '0x5b3240b6be3e7487d61cd1afdfc7fe4fa1d81e6400000000000000000000037b', // dola/bb-a-USD (mainnet)
    '0xb54b2125b711cd183edd3dd09433439d5396165200000000000000000000075e', // miMATIC/bb-am-USD (polygon)
    '0x4ce0bd7debf13434d3ae127430e9bd4291bfb61f00020000000000000000038b', // STG/bba-usd (mainnet)
    '0x334c96d792e4b26b841d28f53235281cec1be1f200020000000000000000038a', // rETH/bba-usd (mainnet)
    '0x53bc3cba3832ebecbfa002c12023f8ab1aa3a3a0000000000000000000000411', // TUSD/bb-a-usd (mainnet)
    '0x4c8d2e60863e8d7e1033eda2b3d84e92a641802000000000000000000000040f', // FRAX/aave-usdc (mainnet)
  ];

  return treatAsDeep.includes(pool.id);
}

/**
 * Pool addresses that have underlying tokens that generate boosted yield. Used
 * for APR display only.
 */
export function hasBoostedAPR(address: string): boolean {
  const boostedPoolAddresses = [
    '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd', // bb-a-USD1 (goerli)
    '0x3d5981bdd8d3e49eb7bbdc1d2b156a3ee019c18e', // bb-a-USD2 (goerli)
    '0x48e6b98ef6329f8f0a30ebb8c7c960330d648085', // bb-am-USD (polygon)
    '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb2', // bb-a-USD1 (mainnet)
    '0xa13a9247ea42d743238089903570127dda72fe44', // bb-a-USD2 (mainnet)
    '0x3d5981bdd8d3e49eb7bbdc1d2b156a3ee019c18e', // bb-a-USD2 (goerli)
    '0x25accb7943fd73dda5e23ba6329085a3c24bfb6a', // wstETH/bb-a-USD (mainnet)
    '0x5b3240b6be3e7487d61cd1afdfc7fe4fa1d81e64', // dola/bb-a-USD (mainnet)
    '0xb54b2125b711cd183edd3dd09433439d53961652', // miMATIC/bb-am-USD (polygon)
  ];

  return includesAddress(boostedPoolAddresses, address);
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

export function isSwappingHaltable(poolType: PoolType): boolean {
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
  return bnum(pool?.totalShares || '0').eq(0);
}

export function preMintedBptIndex(pool: Pool): number | void {
  return pool.tokensList.findIndex(address =>
    isSameAddress(address, pool.address)
  );
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
    .sort((a, b) => parseFloat(b.weight || '0') - parseFloat(a.weight || '0'));
}

/**
 * @summary returns full URL for pool id, given network.
 */
export function poolURLFor(
  pool: Pick<Pool, 'id' | 'poolType'>,
  network: Network
): string {
  if (network === Network.OPTIMISM) {
    return `https://op.beets.fi/#/pool/${pool.id}`;
  }
  if (pool.poolType && pool.poolType.toString() === 'Element') {
    return `https://app.element.fi/pools/${addressFor(pool.id)}`;
  }
  if (pool.poolType && pool.poolType.toString() === 'FX') {
    return `https://app.xave.finance/#/pool`;
  }

  return `${appUrl()}/${getNetworkSlug(network)}/pool/${pool.id}`;
}

/**
 * @summary Calculates absolute max APR given boost or not.
 * If given boost returns user's max APR.
 * If not given boost returns pool absolute max assuming 2.5x boost.
 * Used primarily for sorting tables by the APR column.
 */
export function absMaxApr(aprs: AprBreakdown, boost?: string): string {
  if (boost) {
    const nonStakingApr = bnum(aprs.swapFees)
      .plus(aprs.tokenAprs.total)
      .plus(aprs.rewardAprs.total);
    const stakingApr = bnum(aprs.stakingApr.min).times(boost).toString();
    return nonStakingApr.plus(stakingApr).toString();
  }

  return aprs.max.toString();
}

/**
 * @summary Returns total APR label, whether range or single value.
 */
export function totalAprLabel(aprs: AprBreakdown, boost?: string): string {
  if (boost) {
    return numF(absMaxApr(aprs, boost), FNumFormats.bp);
  } else if ((hasBalEmissions(aprs) && !isL2.value) || aprs.protocolApr > 0) {
    const minAPR = numF(aprs.min, FNumFormats.bp);
    const maxAPR = numF(aprs.max, FNumFormats.bp);
    return `${minAPR} - ${maxAPR}`;
  }

  return numF(aprs.min, FNumFormats.bp);
}

/**
 * @summary Checks if given pool is BAL 80/20 pool (veBAL)
 */
export function isVeBalPool(poolId: string): boolean {
  return POOLS.IdsMap?.veBAL === poolId;
}
/**
 * @summary Checks if given token address is BAL 80/20 pool (veBAL)
 */
export function isVeBalPoolAddress(address: string): boolean {
  const veBALPoolAddress = POOLS.IdsMap?.veBAL?.slice(0, 42);
  if (!veBALPoolAddress) return false;

  return isSameAddress(veBALPoolAddress, address);
}

interface TokenTreeOpts {
  includeLinearUnwrapped?: boolean;
  includePreMintedBpt?: boolean;
}

/**
 * Parse token tree and extract all token addresses.
 *
 * @param {PoolToken[]} tokenTree - A pool's token tree.
 * @param {TokenTreeOpts} options
 * @returns {string[]} Array of token addresses in tree.
 */
export function tokenTreeNodes(
  tokenTree: PoolToken[],
  options: TokenTreeOpts = { includeLinearUnwrapped: false }
): string[] {
  const addresses: string[] = [];

  for (const token of tokenTree) {
    addresses.push(token.address);
    if (token.token?.pool?.tokens) {
      if (
        !options.includeLinearUnwrapped &&
        isLinear(token.token.pool.poolType)
      ) {
        addresses.push(
          token.token.pool.tokens[token.token.pool.mainIndex].address
        );
      } else {
        const nestedTokens = tokenTreeNodes(token.token.pool?.tokens, options);
        addresses.push(...nestedTokens);
      }
    }
  }

  return uniq(addresses);
}

/**
 * Parse token tree and extract all leaf token addresses.
 *
 * @param {PoolToken[]} tokenTree - A pool's token tree.
 * @param {TokenTreeOpts} options
 * @returns {string[]} Array of token addresses in tree.
 */
export function tokenTreeLeafs(
  tokenTree: PoolToken[],
  options: TokenTreeOpts = { includeLinearUnwrapped: false }
): string[] {
  const addresses: string[] = [];

  for (const token of tokenTree) {
    if (token.token?.pool?.tokens) {
      if (
        !options.includeLinearUnwrapped &&
        isLinear(token.token.pool.poolType)
      ) {
        addresses.push(
          token.token.pool.tokens[token.token.pool.mainIndex].address
        );
      } else {
        const nestedTokens = tokenTreeLeafs(token.token.pool.tokens, options);
        addresses.push(...removeAddress(token.address, nestedTokens));
      }
    } else if (!token.token?.pool?.poolType) {
      addresses.push(token.address);
    }
  }

  return uniq(addresses);
}

function isSubPool(poolOrToken: Pool | SubPool): poolOrToken is SubPool {
  return (poolOrToken as SubPool).mainIndex !== undefined;
}

/**
 * Get all unique token tree tokens as flat array.
 *
 * @param {PoolToken[]} tokenTree - A pool's token tree.
 * @param {TokenTreeOpts} options
 * @returns {PoolToken[]} Flat array of tokens in tree.
 */
export function flatTokenTree(
  pool: Pool | SubPool,
  options: TokenTreeOpts = {
    includeLinearUnwrapped: false,
    includePreMintedBpt: false,
  }
): PoolToken[] {
  const tokens: PoolToken[] = [];

  if (!options.includePreMintedBpt && !isSubPool(pool)) {
    pool = removeBptFrom(pool);
  }

  const nestedTokens = pool?.tokens || [];

  nestedTokens.forEach(token => {
    if (!isSameAddress(pool.address, token.address)) {
      tokens.push(token);
    }

    if (token.token?.pool?.tokens) {
      if (
        !options.includeLinearUnwrapped &&
        isLinear(token.token.pool.poolType)
      ) {
        tokens.push(token.token.pool.tokens[token.token.pool.mainIndex]);
      } else {
        const nestedTokens = flatTokenTree(token.token.pool, options);
        tokens.push(...nestedTokens);
      }
    }
  });

  // Avoid duplicated tokens with the same address
  return uniqWith(tokens, (token1, token2) =>
    isSameAddress(token1.address, token2.address)
  );
}

/**
 * Removes pre-minted pool token from tokensList.
 *
 * @param {Pool} pool - Pool to get tokensList from.
 * @returns tokensList excluding pre-minted BPT address.
 */
export function tokensListExclBpt(pool: Pool): string[] {
  return removeAddress(pool.address, pool.tokensList);
}

/**
 * Returns a new (cloned) pool with pre-minted pool tokens removed from both tokensList and tokenTree.
 */
export function removeBptFrom(pool: Pool): Pool {
  const newPool = cloneDeep(pool);
  newPool.tokensList = tokensListExclBpt(pool);

  newPool.tokens = newPool.tokens.filter(
    token => !isSameAddress(newPool.address, token.address)
  );

  newPool.tokens.forEach(token => {
    if (token.token?.pool) {
      removeBptFromPoolTokenTree(token.token.pool);
    }
  });
  return newPool;
}

/**
 * Updates the passed subPool by removing its pre-minted tokens.
 */
export function removeBptFromPoolTokenTree(pool: SubPool) {
  if (pool.tokens) {
    removeBptFromTokens(pool);

    pool.tokens.forEach(token => {
      if (token.token?.pool) {
        removeBptFromPoolTokenTree(token.token.pool);
      }
    });
  }
  return pool;
}

/**
 * Updates the passed subPool by removing the preminted token from tokens and updating mainIndex accordingly.
 */
export function removeBptFromTokens(pool: SubPool) {
  if (!pool.tokens) {
    return;
  }

  const premintedIndex = pool.tokens.findIndex(token =>
    isSameAddress(pool.address, token.address)
  );

  if (premintedIndex === -1) return;

  // Remove preminted token by index
  pool.tokens.splice(premintedIndex, 1);

  // Fix mainIndex after removing premintedBPT
  if (pool.mainIndex && premintedIndex < pool.mainIndex) {
    pool.mainIndex -= 1;
  }
}

export function findMainTokenAddress(pool: SubPool | null) {
  if (!pool || !pool.tokens) return '';
  return pool.tokens[pool.mainIndex].address;
}

/**
 * Find token in token tree with address.
 *
 * @param {Pool} pool - A pool
 * @param {string} tokenAddress - Address of token to find in tree.
 * @param {TokenTreeOpts} options
 */
export function findTokenInTree(
  pool: Pool,
  tokenAddress: string,
  options: TokenTreeOpts = { includeLinearUnwrapped: false }
): PoolToken | undefined {
  const tokens = flatTokenTree(pool, options);
  return tokens.find(token => isSameAddress(token.address, tokenAddress));
}

/**
 * @summary Check if pool should be accessible in UI
 */
export function isBlocked(pool: Pool, account: string): boolean {
  const requiresAllowlisting =
    isStableLike(pool.poolType) || isManaged(pool.poolType);
  const isOwnedByUser =
    pool.owner && isAddress(account) && isSameAddress(pool.owner, account);
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
 * Checks if pool ID is included in the list of pools that joins should be
 * disabled for, e.g. you can't access the invest page.
 *
 * @param {string} id - The pool ID to check
 * @returns {boolean} True if included in list.
 */
export function isJoinsDisabled(id: string): boolean {
  return POOLS.DisabledJoins.includes(id);
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
  const isPreMintedBptPool = computed(
    (): boolean => !!pool.value && isPreMintedBptType(pool.value.poolType)
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
  const managedPoolWithSwappingHalted = computed(
    (): boolean =>
      !!pool.value && isManagedPool.value && !pool.value.onchain?.swapEnabled
  );
  const isWethPool = computed(
    (): boolean => !!pool.value && isWeth(pool.value)
  );
  const isMainnetWstETHPool = computed(
    (): boolean =>
      !!pool.value && includesWstEth(pool.value.tokensList) && isMainnet.value
  );
  const noInitLiquidityPool = computed(
    () => !!pool.value && noInitLiquidity(pool.value)
  );

  // pool is "Weighted" and some of the rate providers are not on our approved list
  const hasNonApprovedRateProviders = computed(
    () =>
      pool.value &&
      isWeighted(pool.value.poolType) &&
      !pool.value?.priceRateProviders?.every(
        provider =>
          ALLOWED_RATE_PROVIDERS['*'][provider.address] ||
          ALLOWED_RATE_PROVIDERS[provider.token?.address]?.[provider.address]
      )
  );

  return {
    // computed
    isStablePool,
    isMetaStablePool,
    isStablePhantomPool,
    isComposableStablePool,
    isStableLikePool,
    isComposableStableLikePool,
    isPreMintedBptPool,
    isDeepPool,
    isShallowComposableStablePool,
    isWeightedPool,
    isWeightedLikePool,
    isManagedPool,
    isLiquidityBootstrappingPool,
    managedPoolWithSwappingHalted,
    isWethPool,
    isMainnetWstETHPool,
    noInitLiquidityPool,
    hasNonApprovedRateProviders,
    // methods
    isStable,
    isMetaStable,
    isStablePhantom,
    isStableLike,
    isWeighted,
    isLiquidityBootstrapping,
    isWeightedLike,
    isSwappingHaltable,
    isPreMintedBptType,
    isWeth,
    noInitLiquidity,
    isMigratablePool,
    poolWeightsLabel,
    orderedTokenAddresses,
    orderedPoolTokens,
  };
}
