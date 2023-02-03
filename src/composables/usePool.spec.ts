import { Pool, PoolToken, SubPool } from '@/services/pool/types';
import { BoostedPoolMock } from '@/__mocks__/pool';
import { cloneDeep } from 'lodash';
import {
  findTokenInTree,
  flatTokenTree,
  findMainTokenAddress,
  removeBptFrom,
  tokenTreeLeafs,
  tokenTreeNodes,
  removeBptFromPoolTokenTree,
} from './usePool';

vi.mock('@/services/rpc-provider/rpc-provider.service');

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
      '0xa13a9247ea42d743238089903570127dda72fe44', // bb-a-USD
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
      '0xa13a9247ea42d743238089903570127dda72fe44', // bb-a-USD
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
      '0xa13a9247ea42d743238089903570127dda72fe44', //Preminted token address to be deleted
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
