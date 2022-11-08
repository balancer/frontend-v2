import { poolWith3NestedLevels } from '@/tests/builders/pools.builders';
import { BoostedPoolMock } from '@/__mocks__/pool';
import {
  calculateTokenBPTShareByAddress,
  findTokenByAddress,
  getUnderlyingTokens,
  tokenTreeLeafs,
  tokenTreeNodes,
} from './usePool';

jest.mock('@/services/rpc-provider/rpc-provider.service');

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

//Pool address: 0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d
test('Can access 3 deep levels of nested tokens', () => {
  expect(poolWith3NestedLevels.address).toBe(
    '0xa13a9247ea42d743238089903570127dda72fe44'
  );
  expect(poolWith3NestedLevels.tokensList).toEqual([
    '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
    '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
    '0xae37d54ae477268b9997d4161b96b8200755935c',
  ]);

  const rootTokenSymbols = poolWith3NestedLevels.tokens.map(
    token => token?.symbol
  );

  expect(rootTokenSymbols).toEqual([
    'bb-a-USDT',
    'bb-a-USDC',
    'bb-a-USD',
    'bb-a-DAI',
  ]);

  const firstTokenAddress = poolWith3NestedLevels.tokensList[0];
  const firstToken = findTokenByAddress(
    poolWith3NestedLevels,
    firstTokenAddress
  );
  expect(firstToken?.symbol).toBe('bb-a-USDT');
  expect(firstToken?.address).toBe(firstTokenAddress);
  const firstChildrenTokens = getUnderlyingTokens(
    poolWith3NestedLevels,
    firstTokenAddress
  );
  expect(firstChildrenTokens.length).toBe(2);
  expect(firstChildrenTokens[0].symbol).toBe('USDT');
  expect(firstChildrenTokens[1].symbol).toBe('aUSDT');

  const secondTokenAddress = poolWith3NestedLevels.tokensList[1];
  const secondToken = findTokenByAddress(
    poolWith3NestedLevels,
    secondTokenAddress
  );
  expect(secondToken?.symbol).toBe('bb-a-USDC');
  const secondChildrenTokens = getUnderlyingTokens(
    poolWith3NestedLevels,
    secondTokenAddress
  );
  expect(secondChildrenTokens.length).toBe(2);
  expect(secondChildrenTokens[0].symbol).toBe('USDC');
  expect(secondChildrenTokens[1].symbol).toBe('aUSDC');

  const thirdTokenAddress = poolWith3NestedLevels.tokensList[2];
  const thirdToken = findTokenByAddress(
    poolWith3NestedLevels,
    thirdTokenAddress
  );
  expect(thirdToken?.symbol).toBe('bb-a-DAI');
  const thirdChildrenTokens = getUnderlyingTokens(
    poolWith3NestedLevels,
    thirdTokenAddress
  );
  expect(thirdChildrenTokens.length).toBe(2);
  expect(thirdChildrenTokens[0].symbol).toBe('aDAI');
  expect(thirdChildrenTokens[1].symbol).toBe('DAI');
});

test('calculate BPT shares', () => {
  expect(
    calculateTokenBPTShareByAddress(
      poolWith3NestedLevels,
      '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83' // bb-a-USDC
    )
  ).toBe('0.99999997005795420184');

  expect(
    calculateTokenBPTShareByAddress(
      poolWith3NestedLevels,
      '0xae37d54ae477268b9997d4161b96b8200755935c' // bb-a-DAI
    )
  ).toBe('0.99999996975306353788');
});
