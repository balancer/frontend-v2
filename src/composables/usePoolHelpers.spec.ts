import { APR_THRESHOLD } from '@/constants/pools';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { Pool, PoolToken, PoolType, SubPool } from '@/services/pool/types';
import { BoostedPoolMock } from '@/__mocks__/pool';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { Network } from '@/lib/config/types';
import { mountComposableWithDefaultTokensProvider as mountComposable } from '@tests/mount-helpers';

import {
  aCustomWeightedPool,
  anOnchainPoolData,
  anOnchainTokenData,
  aPool,
  aPriceRateProvider,
  aStablePool,
} from '@tests/unit/builders/pool.builders';
import { silenceConsoleLog } from '@tests/unit/console';
import { cloneDeep } from 'lodash';
import {
  findMainTokenAddress,
  findTokenInTree,
  flatTokenTree,
  isManaged,
  removeBptFrom,
  removeBptFromPoolTokenTree,
  tokenTreeLeafs,
  tokenTreeNodes,
  usePoolHelpers,
  deprecatedDetails,
  isJoinsDisabled,
  totalAprLabel,
  absMaxApr,
  poolURLFor,
  noInitLiquidity,
  filterTokensInList,
  isComposableStableV1,
  isComposableStable,
  tokenWeight,
  joinTokens,
  wNativeAssetAddress,
  tokensListExclPoolTokens,
  boostedProtocols,
} from './usePoolHelpers';
import {
  daiAddress,
  nativeAssetAddress,
  wethAddress,
} from '@tests/unit/builders/address';
import { anAprBreakdown } from '@tests/unit/builders/sdk-pool.builders';
import { aBoostedPool } from '@/__mocks__/boosted-pool';
import { poolIdWithTwoBoostedProtocols } from '@/lib/config/goerli/pools';

silenceConsoleLog(vi, message => message.startsWith('Fetching'));

describe('tokenTreeNodes', () => {
  it('returns all nodes including unwrapped Linear tokens', () => {
    const nodes = tokenTreeNodes(BoostedPoolMock.tokens, {
      includeLinearUnwrapped: true,
    });
    expect(nodes).toEqual([
      '0x2f4eb100552ef93840d5adc30560e5513dfffacb', // bb-a-USDT
      '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
      '0xf8fd466f12e236f4c96f7cce6c79eadb819abf58', // aUSDT
      '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83', // bb-a-USDC
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      '0xd093fa4fb80d09bb30817fdcd442d4d02ed3e5de', // aUSDC
      '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd', // bb-a-USD
      '0xae37d54ae477268b9997d4161b96b8200755935c', // bb-a-DAI
      '0x02d60b84491589974263d922d9cc7a3152618ef6', // aDAI
      '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    ]);
  });

  it('returns all nodes excluding unwrapped linear tokens', () => {
    const nodes = tokenTreeNodes(BoostedPoolMock.tokens);
    expect(nodes).toEqual([
      '0x2f4eb100552ef93840d5adc30560e5513dfffacb', // bb-a-USDT
      '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
      '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83', // bb-a-USDC
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd', // bb-a-USD
      '0xae37d54ae477268b9997d4161b96b8200755935c', // bb-a-DAI
      '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    ]);
  });
});

describe('tokenTreeLeafs', () => {
  it('returns all leafs including unwrapped Linear tokens', () => {
    const leafs = tokenTreeLeafs(BoostedPoolMock.tokens, {
      includeLinearUnwrapped: true,
    });
    expect(leafs).toEqual([
      '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
      '0xf8fd466f12e236f4c96f7cce6c79eadb819abf58', // aUSDT
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      '0xd093fa4fb80d09bb30817fdcd442d4d02ed3e5de', // aUSDC
      '0x02d60b84491589974263d922d9cc7a3152618ef6', // aDAI
      '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    ]);
  });

  it('returns all leafs excluding unwrapped linear tokens', () => {
    const leafs = tokenTreeLeafs(BoostedPoolMock.tokens);
    expect(leafs).toEqual([
      '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    ]);
  });
});

describe('FlatTokenTree should', () => {
  test('avoid linear unwrapped tokens by default', () => {
    expect(
      flatTokenTree(BoostedPoolMock, {
        includeLinearUnwrapped: false,
      }).map(t => t.symbol)
    ).toIncludeSameMembers([
      'bb-a-USDT',
      'USDT',
      'bb-a-USDC',
      'USDC',
      'bb-a-DAI',
      'DAI',
    ]);
  });

  test('include linear unwrapped tokens when includeLinearUnwrapped is true', () => {
    expect(
      flatTokenTree(BoostedPoolMock, { includeLinearUnwrapped: true }).map(
        t => t.symbol
      )
    ).toIncludeSameMembers([
      'bb-a-USDT',
      'USDT',
      'aUSDT',
      'bb-a-USDC',
      'USDC',
      'aUSDC',
      'bb-a-DAI',
      'aDAI',
      'DAI',
    ]);
  });

  test('not include linear unwrapped tokens when includeLinearUnwrapped is false', () => {
    const symbols = flatTokenTree(BoostedPoolMock, {
      includeLinearUnwrapped: false,
    }).map(t => t.symbol);

    expect(symbols).toIncludeSameMembers([
      'bb-a-USDT',
      'USDT',
      'bb-a-USDC',
      'USDC',
      'bb-a-DAI',
      'DAI',
    ]);
  });
});

describe('removeBptFrom should', () => {
  test('remove preminted tokens given a pool', () => {
    const poolWithoutPremintedBPT = removeBptFrom(BoostedPoolMock) as Pool;

    const daiNestedPool = poolWithoutPremintedBPT.tokens[2].token
      ?.pool as SubPool;

    expect(daiNestedPool.tokens).toBeDefined();
    expect(daiNestedPool.mainIndex).toBe(1);

    expect(
      poolWithoutPremintedBPT.tokens?.map(t => t.symbol)
    ).toIncludeSameMembers(['bb-a-USDT', 'bb-a-USDC', 'bb-a-DAI']);

    const usdtNestedTokens = poolWithoutPremintedBPT.tokens[0].token?.pool
      ?.tokens as PoolToken[];

    expect(usdtNestedTokens.map(t => t.symbol)).toIncludeSameMembers([
      'aUSDT',
      'USDT',
    ]);

    const usdcNestedTokens = poolWithoutPremintedBPT.tokens[1].token?.pool
      ?.tokens as PoolToken[];

    expect(usdcNestedTokens.map(t => t.symbol)).toIncludeSameMembers([
      'aUSDC',
      'USDC',
    ]);

    const daiNestedTokens = poolWithoutPremintedBPT.tokens[2].token?.pool
      ?.tokens as PoolToken[];

    expect(daiNestedTokens.map(t => t.symbol)).toIncludeSameMembers([
      'aDAI',
      'DAI',
    ]);

    // Original objects keeps original tokens
    expect(BoostedPoolMock.tokens.map(t => t.symbol)).toIncludeSameMembers([
      'bb-a-USDT',
      'bb-a-USDC',
      'bb-a-USD',
      'bb-a-DAI',
    ]);
  });

  test('remove preminted tokens address from tokenList', () => {
    expect(BoostedPoolMock.tokensList).toEqual([
      '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
      '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
      '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd', //Preminted token address to be deleted
      '0xae37d54ae477268b9997d4161b96b8200755935c',
    ]);

    const poolWithoutPremintedBPT = removeBptFrom(BoostedPoolMock) as Pool;

    expect(poolWithoutPremintedBPT.tokensList).toEqual([
      '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
      '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
      '0xae37d54ae477268b9997d4161b96b8200755935c',
    ]);
  });
});

describe('remove preminted tokens given a SubPool', () => {
  test('of USDT', () => {
    const originalUsdtTree = cloneDeep(
      BoostedPoolMock.tokens[0].token?.pool as SubPool
    );

    expect(originalUsdtTree.mainIndex).toBe(1);

    const usdtTreeWithoutPreminted =
      removeBptFromPoolTokenTree(originalUsdtTree);

    //Fixes the mainIndex after removing premintedBPT
    expect(usdtTreeWithoutPreminted.mainIndex).toBe(0);

    expect(
      usdtTreeWithoutPreminted.tokens?.map(t => t.symbol)
    ).toIncludeSameMembers(['USDT', 'aUSDT']);

    //Updates the original Tree
    expect(originalUsdtTree.tokens?.map(t => t.symbol)).toIncludeSameMembers([
      'USDT',
      'aUSDT',
    ]);
  });

  test('of DAI', () => {
    const originalDaiTree = cloneDeep(
      BoostedPoolMock.tokens[3].token?.pool
    ) as SubPool;

    expect(originalDaiTree.mainIndex).toBe(1);

    // Updates the original Tree
    const daiTreeWithoutPreminted = removeBptFromPoolTokenTree(originalDaiTree);

    //Fixes the mainIndex after removing premintedBPT
    expect(daiTreeWithoutPreminted.mainIndex).toBe(1);

    expect(
      daiTreeWithoutPreminted.tokens?.map(t => t.symbol)
    ).toIncludeSameMembers(['DAI', 'aDAI']);

    // updates the original tree
    expect(originalDaiTree.tokens?.map(t => t.symbol)).toIncludeSameMembers([
      'DAI',
      'aDAI',
    ]);
  });
});

describe('findTokenInTree should', () => {
  test('find tokens excluding BPT (includePreMintedBpt is the default behavior)', () => {
    const bbaDaiAddress = '0xae37d54ae477268b9997d4161b96b8200755935c';
    const bbaDaiToken = findTokenInTree(BoostedPoolMock, bbaDaiAddress);
    const bbaDaiNestedTokens = bbaDaiToken?.token?.pool?.tokens;
    expect(bbaDaiNestedTokens?.map(t => t.symbol)).toIncludeSameMembers([
      'aDAI',
      'DAI',
    ]);
  });

  test('find tokens when including preminted BPT', () => {
    const bbAUsdtAddress = '0x2f4eb100552ef93840d5adc30560e5513dfffacb';
    const bbaUsdtToken = findTokenInTree(BoostedPoolMock, bbAUsdtAddress, {
      includePreMintedBpt: true,
    });
    const bbaUsdtNestedTokens = bbaUsdtToken?.token?.pool?.tokens;
    expect(bbaUsdtNestedTokens?.map(t => t.symbol)).toIncludeSameMembers([
      'bb-a-USDT',
      'USDT',
      'aUSDT',
    ]);
  });
});

test('findMainTokenAddress works after removing BPT', () => {
  const poolWithoutPremintedBPT = removeBptFrom(BoostedPoolMock);
  const bbaUSDTMainAddress = findMainTokenAddress(
    poolWithoutPremintedBPT.tokens[0].token?.pool as SubPool
  );
  expect(bbaUSDTMainAddress).toBe('0xdac17f958d2ee523a2206206994597c13d831ec7'); //USDT

  const bbaUsdcMainAddress = findMainTokenAddress(
    poolWithoutPremintedBPT.tokens[1].token?.pool as SubPool
  );
  expect(bbaUsdcMainAddress).toBe('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'); //USDC

  const bbaDaiMainAddress = findMainTokenAddress(
    poolWithoutPremintedBPT.tokens[2].token?.pool as SubPool
  );
  expect(bbaDaiMainAddress).toBe('0x6b175474e89094c44da98b954eedeac495271d0f'); //DAI
});

describe('usePool composable', () => {
  initDependenciesWithDefaultMocks();

  function mountUsePool(pool: Pool | undefined) {
    const { result } = mountComposable(() => usePoolHelpers(ref(pool)));
    return result;
  }

  test('works given an undefined pool', () => {
    const {
      isComposableStableLikePool,
      isComposableStablePool,
      isDeepPool,
      isDeprecatedPool,
      isLiquidityBootstrappingPool,
      isMainnetWstETHPool,
      isManagedPool,
      isMetaStablePool,
      isMigratablePool,
      isPreMintedBptPool,
      isShallowComposableStablePool,
      isStableLikePool,
      isStablePhantomPool,
      isStablePool,
      isWeightedLikePool,
      isWeightedPool,
      isWrappedNativeAsset,
      isWrappedNativeAssetPool,
      managedPoolWithSwappingHalted,
      poolWeightsLabel,
      poolJoinTokens,
    } = mountUsePool(undefined);

    const weightedPool = aWeightedPool();

    expect(isComposableStablePool.value).toBeFalse();
    expect(isComposableStableLikePool.value).toBeFalse();
    expect(isDeepPool.value).toBeFalse();
    expect(isDeprecatedPool.value).toBeFalse();
    expect(isLiquidityBootstrappingPool.value).toBeFalse();

    expect(isMainnetWstETHPool.value).toBeFalse();
    expect(isManagedPool.value).toBeFalse();

    expect(isMetaStablePool.value).toBeFalse();
    expect(isPreMintedBptPool.value).toBeFalse();
    expect(isShallowComposableStablePool.value).toBeFalse();
    expect(isStablePool.value).toBeFalse();
    expect(isStableLikePool.value).toBeFalse();
    expect(isWeightedPool.value).toBeFalse();
    expect(isWeightedLikePool.value).toBeFalse();
    expect(isStablePhantomPool.value).toBeFalse();
    expect(isWrappedNativeAsset(weightedPool)).toBeTrue();
    expect(isWrappedNativeAssetPool.value).toBeFalse();

    expect(managedPoolWithSwappingHalted.value).toBeFalse();
    expect(noInitLiquidity(weightedPool)).toBeTrue();
    expect(isMigratablePool(weightedPool)).toBeFalse();

    expect(poolWeightsLabel(weightedPool)).toBe(
      '5,000% onchain token symbol, 5,000% onchain token symbol'
    );
    expect(poolJoinTokens.value).toEqual([]);
  });

  test('handles pool types', () => {
    const {
      isLiquidityBootstrapping,
      isMetaStable,
      isPreMintedBptType,
      isStable,
      isStableLike,
      isStablePhantom,
      isSwappingHaltable,
      isWeighted,
    } = mountUsePool(undefined);

    expect(isLiquidityBootstrapping(PoolType.AaveLinear)).toBeFalse();
    expect(
      isLiquidityBootstrapping(PoolType.LiquidityBootstrapping)
    ).toBeTrue();

    expect(isMetaStable(PoolType.Linear)).toBeFalse();
    expect(isMetaStable(PoolType.MetaStable)).toBeTrue();

    expect(isPreMintedBptType(PoolType.MetaStable)).toBeFalse();
    expect(isPreMintedBptType(PoolType.StablePhantom)).toBeTrue();
    expect(isPreMintedBptType(PoolType.ComposableStable)).toBeTrue();

    expect(isStable(PoolType.Stable)).toBeTrue();
    expect(isStable(PoolType.ComposableStable)).toBeFalse();

    expect(isStableLike(PoolType.AaveLinear)).toBeFalse();
    expect(isStableLike(PoolType.Stable)).toBeTrue();
    expect(isStableLike(PoolType.MetaStable)).toBeTrue();
    expect(isStableLike(PoolType.StablePhantom)).toBeTrue();
    expect(isStableLike(PoolType.ComposableStable)).toBeTrue();
    expect(isStableLike('FX' as PoolType)).toBeTrue();

    expect(isStablePhantom(PoolType.StablePhantom)).toBeTrue();
    expect(isStablePhantom(PoolType.Stable)).toBeFalse();

    expect(isSwappingHaltable(PoolType.StablePhantom)).toBeFalse();
    expect(isSwappingHaltable(PoolType.Investment)).toBeTrue();
    expect(isSwappingHaltable(PoolType.LiquidityBootstrapping)).toBeTrue();

    expect(isWeighted(PoolType.Weighted)).toBeTrue();

    expect(isManaged(PoolType.Managed)).toBeFalse();
    expect(isManaged(PoolType.Investment)).toBeTrue();
  });

  test('generates weights Label', () => {
    const weightedPool = aWeightedPool();
    if (weightedPool.onchain)
      weightedPool.onchain.tokens = {
        token1Address: anOnchainTokenData({ weight: 0.25, symbol: 'wETH' }),
      };

    const { poolWeightsLabel } = mountUsePool(weightedPool);

    expect(poolWeightsLabel(weightedPool)).toBe('25% wETH');
  });

  test('generates weights Label for Stable Like Pools', () => {
    const stablePool = aStablePool();
    if (stablePool.onchain)
      stablePool.onchain.tokens = {
        token1Address: anOnchainTokenData({ weight: 0.25, symbol: 'wETH' }),
        token2Address: anOnchainTokenData({ weight: 0.74, symbol: 'BAL' }),
      };

    const { poolWeightsLabel } = mountUsePool(stablePool);

    expect(poolWeightsLabel(stablePool)).toBe('wETH, BAL');
  });

  test('hasNonApprovedRateProviders is false when pool is not Weighted', () => {
    const stablePool = aStablePool();

    const { hasNonApprovedRateProviders } = mountUsePool(stablePool);

    expect(hasNonApprovedRateProviders.value).toBeFalse();
  });

  test('hasNonApprovedRateProviders is true when one rate provider is not allowed', async () => {
    const notAllowedProviderAddress = 'not allowed address';
    const weightedPool = aCustomWeightedPool({
      priceRateProviders: [
        aPriceRateProvider({
          address: notAllowedProviderAddress,
        }),
      ],
    });
    const { hasNonApprovedRateProviders } = mountUsePool(weightedPool);

    expect(hasNonApprovedRateProviders.value).toBeTrue();
  });
  test('hasNonApprovedRateProviders is false when the rate provider has ZERO address', async () => {
    const allowedProviderAddress = '0x0000000000000000000000000000000000000000';
    const weightedPool = aCustomWeightedPool({
      priceRateProviders: [
        aPriceRateProvider({
          address: allowedProviderAddress,
        }),
      ],
    });

    const { hasNonApprovedRateProviders } = mountUsePool(weightedPool);

    expect(hasNonApprovedRateProviders.value).toBeFalse();
  });

  test('hasNonApprovedRateProviders is false when the rate provider has allowed address', async () => {
    const allowedProviderAddress = '0xd8143b8e7a6e452e5e1bc42a3cef43590a230031';
    const weightedPool = aCustomWeightedPool({
      priceRateProviders: [
        aPriceRateProvider({
          token: { address: allowedProviderAddress },
          address: allowedProviderAddress,
        }),
      ],
    });

    const { hasNonApprovedRateProviders } = mountUsePool(weightedPool);

    expect(hasNonApprovedRateProviders.value).toBeFalse();
  });

  test('detects deprecated pools', async () => {
    const deprecatedPool = aCustomWeightedPool({ id: 'deprecatedid' });

    const { isDeprecatedPool } = mountUsePool(deprecatedPool);

    expect(isDeprecatedPool.value).toBeTrue();
  });
});

test('returns undefined when there is no deprecated details', async () => {
  expect(deprecatedDetails('inventedId')).toBeUndefined();
});

test('returns existing deprecated details', async () => {
  expect(deprecatedDetails('deprecatedId')).toEqual({});
});

test('detects disabled joins by id', async () => {
  expect(
    isJoinsDisabled(
      '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f'
    )
  ).toBeFalse();

  expect(isJoinsDisabled('testaddresswithdisabledjoins')).toBeTrue();
});

test('generates empty APR label when swapFees are bigger than APR_THRESHOLD', async () => {
  expect(totalAprLabel(anAprBreakdown({ swapFees: APR_THRESHOLD + 1 }))).toBe(
    '-'
  );
});

test('generates APR label without BAL emissions', async () => {
  const aprMin = 12;
  const aprBreakdown = anAprBreakdown({
    swapFees: 10,
    min: aprMin,
  });

  expect(totalAprLabel(aprBreakdown)).toBe('0.12%');
});

test('generates APR label with protocol APR)', async () => {
  const aprMin = 12;
  const aprMax = 14;
  const aprBreakdown = anAprBreakdown({
    swapFees: 10,
    protocolApr: 1,
    min: aprMin,
    max: aprMax,
  });

  expect(totalAprLabel(aprBreakdown)).toBe('0.12% - 0.14%');
});

test('generates APR label with BAL emissions (due to protocol APR)', async () => {
  const aprMin = 14;
  const aprMax = 15;
  const aprBreakdown = anAprBreakdown({
    swapFees: 10,
    protocolApr: 0,
    min: aprMin,
    max: aprMax,
    stakingApr: {
      min: 1,
      max: 2,
    },
  });

  expect(totalAprLabel(aprBreakdown)).toBe('0.14% - 0.15%');
});

test('generates APR label with boost', async () => {
  const boost = '2.5';

  const swapFees = 10;
  const tokenAprsTotal = 5;
  const rewardAprsTotal = 2;

  const aprMin = 1;
  const aprBreakdown = anAprBreakdown({
    swapFees,
    min: aprMin,
    tokenAprs: {
      total: tokenAprsTotal,
      breakdown: {},
    },
    rewardAprs: {
      total: rewardAprsTotal,
      breakdown: {},
    },
  });

  expect(totalAprLabel(aprBreakdown, boost, true)).toBe('0.17%'); // swapFees + tokenAprsTotal + rewardAprsTotal
});

test('generates APR label with boost', async () => {
  const boost = '2.5';

  const swapFees = 10;
  const tokenAprsTotal = 5;
  const rewardAprsTotal = 2;

  const stakingAprMin = 1.5;

  const aprMin = 1;
  const aprBreakdown = anAprBreakdown({
    swapFees,
    min: aprMin,
    tokenAprs: {
      total: tokenAprsTotal,
      breakdown: {},
    },
    rewardAprs: {
      total: rewardAprsTotal,
      breakdown: {},
    },
    stakingApr: {
      min: stakingAprMin,
      max: 2,
    },
  });

  // (swapFees + tokenAprsTotal + rewardAprsTotal) = 10 + 5 + 2 = 17
  // (stakingAprMin * boost ) = 1.5 * 2.5 = 3.75
  // total = 17 + 3.75 = 20.75 --> 0.21%
  expect(totalAprLabel(aprBreakdown, boost, true)).toBe('0.21%');
});

test('generates absMaxApr when no boost', async () => {
  const boost = undefined;

  const aprMax = 2;
  const aprBreakdown = anAprBreakdown({
    max: aprMax,
  });

  expect(absMaxApr(aprBreakdown, boost)).toBe('2');
});

test('poolURLFor OPTIMISM', async () => {
  expect(poolURLFor(aPool({ id: 'testId' }), Network.OPTIMISM)).toBe(
    'https://op.beets.fi/#/pool/testId'
  );
});

test('poolURLFor Element', async () => {
  expect(
    poolURLFor(
      aPool({
        id: '0x9f19a375709baf0e8e35c2c5c68aca646c4c719100000000000000000000006e',
        poolType: 'Element' as PoolType,
      }),
      Network.MAINNET
    )
  ).toBe(
    'https://app.element.fi/pools/0x9f19A375709bAF0E8e35c2c5C68aCA646C4c7191'
  );
});

test('poolURLFor FX', async () => {
  expect(
    poolURLFor(
      aPool({
        id: '0x9f19a375709baf0e8e35c2c5c68aca646c4c719100000000000000000000006e',
        poolType: 'FX' as PoolType,
      }),
      Network.MAINNET
    )
  ).toBe('https://app.xave.co/#/pool');
});

test('poolURLFor Arbitrum', async () => {
  expect(
    poolURLFor(
      aPool({
        id: '0x9f19a375709baf0e8e35c2c5c68aca646c4c719100000000000000000000006e',
        poolType: PoolType.ComposableStable,
      }),
      Network.ARBITRUM
    )
  ).toBe(
    'https://localhost:8080/#/arbitrum/pool/0x9f19a375709baf0e8e35c2c5c68aca646c4c719100000000000000000000006e'
  );
});

test('filters tokens in list', async () => {
  const addresses = [
    '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0xae37d54ae477268b9997d4161b96b8200755935c',
  ];
  expect(
    filterTokensInList(BoostedPoolMock, addresses).map(token => token.address)
  ).toEqual(['0x6b175474e89094c44da98b954eedeac495271d0f']);
});

test('detects ComposableStable and ComposableStableV1 pools', async () => {
  const pool = aPool({
    id: '0x9f19a375709baf0e8e35c2c5c68aca646c4c719100000000000000000000006e',
    poolType: PoolType.ComposableStable,
  });
  expect(isComposableStable(pool.poolType)).toBeTrue();
  expect(isComposableStableV1(pool)).toBeFalse();

  pool.poolTypeVersion = 1;
  expect(isComposableStableV1(pool)).toBeTrue();
});

describe('calculates tokenWeight', async () => {
  it('when pool is stable like', () => {
    const pool = aStablePool();
    expect(tokenWeight(pool, 'any address')).toBe(0);
  });

  it('when pool does not have onchain tokens', () => {
    const pool = aStablePool({ onchain: undefined });
    expect(tokenWeight(pool, 'any address')).toBe(0);
  });

  it('when token is native asset', () => {
    const pool = aPool({
      onchain: anOnchainPoolData({
        tokens: {
          [wethAddress]: anOnchainTokenData({
            weight: 0.7,
            symbol: 'wETH',
          }),
        },
      }),
    });

    expect(tokenWeight(pool, nativeAssetAddress)).toBe(0.7);
  });

  it('when token is not native asset', () => {
    const pool = aPool({
      onchain: anOnchainPoolData({
        tokens: {
          [wethAddress]: anOnchainTokenData({
            weight: 0.7,
            symbol: 'wETH',
          }),
          [daiAddress]: anOnchainTokenData({
            weight: 0.3,
            symbol: 'wETH',
          }),
        },
      }),
    });

    expect(tokenWeight(pool, daiAddress)).toBe(0.3);
  });
});

test('Gets all pool token addresses that can possibly be used to join a pool', async () => {
  expect(joinTokens(BoostedPoolMock)).toEqual([
    '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0xae37d54ae477268b9997d4161b96b8200755935c',
    '0x6b175474e89094c44da98b954eedeac495271d0f',
  ]);
});

test('Returns the wNativeAsset address in the current network (goerli for tests)', () => {
  expect(wNativeAssetAddress()).toBe(wethAddress);
});

test('tokensListExclBptAndBoostedPoolTokens', () => {
  expect(tokensListExclPoolTokens(aWeightedPool())).toEqual([
    '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7',
    '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1',
  ]);
  expect(tokensListExclPoolTokens(BoostedPoolMock)).toEqual([]);
});

test('Returns boosted protocols from boosted pool', () => {
  expect(
    boostedProtocols(aBoostedPool({ id: poolIdWithTwoBoostedProtocols }))
  ).toEqual(['aave', 'morpho']);
});
