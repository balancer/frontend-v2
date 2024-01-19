import { AprBreakdown, PoolType } from '@balancer-labs/sdk';
import { getAddress } from '@ethersproject/address';

import { APR_THRESHOLD } from '@/constants/pools';
import { Network } from '@/lib/config/types';

import {
  bnum,
  includesAddress,
  isSameAddress,
  removeAddress,
  selectByAddress,
} from '@/lib/utils';
import { includesWstEth } from '@/lib/utils/balancer/lido';
import { configService } from '@/services/config/config.service';
import {
  DeprecatedDetails,
  NewVersionAvailableDetails,
  PoolFeature,
  PoolWarning,
} from '@/types/pools';

import {
  AnyPool,
  Pool,
  PoolToken,
  SubPool,
  allLinearTypes,
} from '@/services/pool/types';
import { hasBalEmissions } from './useAPR';
import { cloneDeep, uniq, uniqWith } from 'lodash';
import {
  appUrl,
  getNetworkSlug,
  isMainnet,
  isPoolBoostsEnabled,
} from './useNetwork';
import useNumbers, { FNumFormats, numF } from './useNumbers';
import { dateToUnixTimestamp } from './useTime';
import { poolMetadata } from '@/lib/config/metadata';
import { Protocol } from './useProtocols';
import { usePoolWarning } from './usePoolWarning';
import { VotingPool } from './queries/useVotingPoolsQuery';

const POOLS = configService.network.pools;

/**
 * METHODS
 */
export function addressFor(poolId: string): string {
  return getAddress(poolId.slice(0, 42));
}

export function hasIcon(poolId: string): boolean {
  return !!poolMetadata(poolId)?.hasIcon;
}

export function isLinear(poolType: PoolType): boolean {
  return allLinearTypes.includes(poolType);
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

export function isComposableStableV1(pool: Pool): boolean {
  return isComposableStable(pool.poolType) && pool.poolTypeVersion === 1;
}

export function isComposableStableLike(poolType: PoolType): boolean {
  return isStablePhantom(poolType) || isComposableStable(poolType);
}

export function isFx(poolType: PoolType | string): boolean {
  return poolType === 'FX';
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
  return configService.network.pools.Deep.includes(pool.id);
}

export function isBoosted(pool: Pool) {
  return !!Object.keys(poolMetadata(pool.id)?.features || {}).includes(
    PoolFeature.Boosted
  );
}

export function isGyro(pool: Pool | VotingPool) {
  return [PoolType.Gyro2, PoolType.Gyro3, PoolType.GyroE].includes(
    pool.poolType
  );
}

export function protocolsFor(pool: Pool, feature: PoolFeature): Protocol[] {
  return poolMetadata(pool.id)?.features?.[feature]?.featureProtocols || [];
}

export function boostedProtocols(pool: Pool) {
  if (!isBoosted(pool)) return [];
  return poolMetadata(pool.id)?.features?.[PoolFeature.Boosted]
    ?.featureProtocols;
}

/**
 * Pool addresses that have underlying tokens that generate boosted yield. Used
 * for APR display only.
 */
export function hasBoostedAPR(address: string): boolean {
  const boostedPoolAddresses = configService.network.pools.BoostedApr;
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
    isComposableStable(poolType) ||
    isFx(poolType)
  );
}

export function isUnknownType(poolType: any): boolean {
  return !Object.values(PoolType).includes(poolType);
}

export function isLiquidityBootstrapping(poolType: PoolType): boolean {
  return poolType === PoolType.LiquidityBootstrapping;
}

export function isLBP(poolType: PoolType): boolean {
  return isLiquidityBootstrapping(poolType);
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

export function wNativeAssetAddress() {
  return configService.network.tokens.Addresses.wNativeAsset;
}

export function isWrappedNativeAsset(pool: AnyPool): boolean {
  return includesAddress(pool.tokensList || [], wNativeAssetAddress());
}

export function isMigratablePool(pool: AnyPool) {
  return !!POOLS.Migrations?.[pool.id];
}

export function noInitLiquidity(pool: AnyPool): boolean {
  // Uncomment to DEBUG
  // if (
  //   pool.id ===
  //   '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014'
  // )
  //   return true;
  return bnum(pool?.totalShares || '0').eq(0);
}
export function preMintedBptIndex(pool: Pool): number | void {
  return pool.tokensList.findIndex(address =>
    isSameAddress(address, pool.address)
  );
}

export function createdAfterTimestamp(pool: AnyPool): boolean {
  // Pools should always have valid createTime so, for safety, we block the pool in case we don't get it
  // (createTime should probably not be treated as optional in the SDK types)
  if (!pool.createTime) return true;

  const creationTimestampLimit = dateToUnixTimestamp('2023-03-29');

  // // Uncomment to debug
  // if (
  //   pool.id ===
  //   '0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080'
  // )
  //   creationTimestampLimit = dateToUnixTimestamp('2021-08-13'); //DEBUG DATE

  // Epoch timestamp is bigger if the date is older
  return pool.createTime > creationTimestampLimit;
}

/**
 * @summary Orders pool token addresses by weight if weighted pool
 * @returns Array of checksum addresses
 */
export function orderedTokenAddresses(pool: AnyPool): string[] {
  const sortedTokens = orderedPoolTokens(pool, pool.tokens);
  return sortedTokens.map(token => getAddress(token?.address || ''));
}

/**
 * @summary Orders pool tokens by weight if weighted pool
 */
export function orderedPoolTokens(
  pool: Pool,
  tokens: PoolToken[]
): PoolToken[] {
  if (isDeep(pool)) {
    const leafs = tokenTreeLeafs(tokens);
    const flatTokens = flatTokenTree(pool);
    return flatTokens.filter(token => includesAddress(leafs, token.address));
  } else if (isComposableStable(pool.poolType) || isLinear(pool.poolType)) {
    return tokens.filter(token => !isSameAddress(token.address, pool.address));
  } else if (isStableLike(pool.poolType)) return tokens;

  return orderByWeight(tokens);
}

export function orderByWeight<T extends { weight?: string | null }>(
  tokens: T[]
): T[] {
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
    return `https://app.xave.co/#/pool`;
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
export function totalAprLabel(
  aprs: AprBreakdown,
  boost?: string,
  isConnected?: boolean
): string {
  if (aprs.swapFees > APR_THRESHOLD) {
    return '-';
  }
  if (boost && boost !== '1' && isConnected) {
    return numF(absMaxApr(aprs, boost), FNumFormats.bp);
  }
  if (
    (hasBalEmissions(aprs) && isPoolBoostsEnabled.value) ||
    aprs.protocolApr > 0
  ) {
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
 * Filters the tokenList by excluding the addresses of those tokens that have token.pool defined.
 * This is useful in certain cases, for example, when we want to exclude tokens like bb-a-DAI or bb-ag-GNO in coingecko requests,
 * as they will be missing.
 */
export function tokensListExclPoolTokens(pool: Pool): string[] {
  return tokensListExclBpt(pool).filter(address => {
    const token = findTokenInTree(pool, address);
    return !token?.token?.pool;
  });
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
 * Returns an array with the tokens from the given pool whose addresses are included in the given addresses.
 *
 * @param {Pool} pool - A pool
 * @param {string[]} addresses - An address list.
 */
export function filterTokensInList(pool: Pool, addresses: string[]) {
  return flatTokenTree(pool).filter(
    token => token.address && !includesAddress(addresses, token.address)
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
  return POOLS.DisabledJoins.includes(id.toLowerCase());
}

/**
 * Should recovery exits be the only option for this pool?
 *
 * @param {Pool} pool - The pool to check
 */
export function isRecoveryExitsOnly(pool: Pool): boolean {
  const isInRecoveryAndPausedMode = !!pool.isInRecoveryMode && !!pool.isPaused;
  const isVulnCsPoolAndInRecoveryMode =
    usePoolWarning(toRef(pool, 'id')).isAffectedBy(
      PoolWarning.CspPoolVulnWarning
    ) && !!pool.isInRecoveryMode;
  const isNotDeepAndCsV1 = !isDeep(pool) && isComposableStableV1(pool);

  return (
    isInRecoveryAndPausedMode ||
    isVulnCsPoolAndInRecoveryMode ||
    isNotDeepAndCsV1
  );
}

/**
 * Should hide the display of APRs for this pool.
 */
export function shouldHideAprs(poolId: string): boolean {
  if (!poolId) return false;

  return usePoolWarning(ref(poolId)).isAffectedBy(
    PoolWarning.CspPoolVulnWarning
  );
}

/**
 * Checks if pool ID is included in the list of deprecated pools
 * @param {string} id - The pool ID to check
 * @returns {boolean} True if included in list
 */
export function deprecatedDetails(id: string): DeprecatedDetails | undefined {
  return POOLS.Deprecated?.[id.toLowerCase()];
}

/**
 * Checks if pool ID is included in the list of pools that have a new version available (but are not deprecated yet)
 * @param {string} id - The pool ID to check
 * @returns {boolean} True if included in list
 */
export function newVersionDetails(
  id: string
): NewVersionAvailableDetails | undefined {
  return POOLS.NewVersionAvailable?.[id.toLowerCase()];
}

/**
 * Checks if pool ID is included in the list of deprecated pools
 * @param {string} id - The pool ID to check
 * @returns {boolean} True if included in list
 */
export function gaugeMigrationDetails(
  id: string
): DeprecatedDetails | undefined {
  return POOLS.GaugeMigration?.[id.toLowerCase()];
}

/**
 * Gets weight of token in pool if relevant, e.g if it's a weighted pool.
 * If not, returns 0.
 *
 * @param {Pool} pool - The pool to check
 * @param {string} tokenAddress - The address of the token to check
 * @returns {number} The weight of the token in the pool
 */
export function tokenWeight(pool: Pool, tokenAddress: string): number {
  if (isStableLike(pool.poolType)) return 0;
  if (!pool?.onchain?.tokens) return 0;

  const { nativeAsset, wNativeAsset } = configService.network.tokens.Addresses;

  if (isSameAddress(tokenAddress, nativeAsset)) {
    return selectByAddress(pool.onchain.tokens, wNativeAsset)?.weight || 1;
  }
  return selectByAddress(pool.onchain.tokens, tokenAddress)?.weight || 1;
}

/**
 * Gets all pool token addresses that can possibly be used to join a pool.
 *
 * @param {Pool} pool - The pool to check
 * @returns {string[]} The addresses of the tokens that can be used to join the pool
 */
export function joinTokens(pool: Pool): string[] {
  let addresses: string[] = [];

  addresses = isDeep(pool) ? tokenTreeNodes(pool.tokens) : pool.tokensList;

  return removeAddress(pool.address, addresses);
}

/**
 * COMPOSABLE
 */
export function usePoolHelpers(pool: Ref<AnyPool> | Ref<undefined>) {
  const { fNum } = useNumbers();

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
          `${fNum(token.weight, {
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
  const isWrappedNativeAssetPool = computed(
    (): boolean => !!pool.value && isWrappedNativeAsset(pool.value)
  );
  const isMainnetWstETHPool = computed(
    (): boolean =>
      !!pool.value && includesWstEth(pool.value.tokensList) && isMainnet.value
  );

  const poolJoinTokens = computed((): string[] =>
    pool.value ? joinTokens(pool.value) : []
  );

  // pool is "Weighted" and some of the rate providers are not on our approved list
  const hasNonApprovedRateProviders = computed(
    () =>
      pool.value &&
      isWeighted(pool.value.poolType) &&
      !pool.value?.priceRateProviders?.every(
        provider =>
          configService.network.rateProviders['*'][provider.address] ||
          configService.network.rateProviders[provider.token?.address]?.[
            provider.address
          ]
      )
  );

  const isDeprecatedPool = computed(() => {
    return !!pool.value && !!POOLS.Deprecated?.[pool.value.id];
  });

  const isNewPoolAvailable = computed(() => {
    return !!pool.value && !!POOLS.NewVersionAvailable?.[pool.value.id];
  });

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
    isWrappedNativeAssetPool,
    isMainnetWstETHPool,
    hasNonApprovedRateProviders,
    isDeprecatedPool,
    isNewPoolAvailable,
    poolJoinTokens,
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
    isWrappedNativeAsset,
    noInitLiquidity,
    isMigratablePool,
    poolWeightsLabel,
    orderedTokenAddresses,
    orderedPoolTokens,
    joinTokens,
  };
}
