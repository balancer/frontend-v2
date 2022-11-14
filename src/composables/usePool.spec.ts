import { poolWith3NestedLevels } from '@/tests/builders/pools.builders';
import { BoostedPoolMock } from '@/__mocks__/pool';
import {
  calculateTokenBPTShareByAddress,
  findTokenInTree,
  findTokensInTree as findTokensInTree,
  flatTokenTree,
  getUnderlyingTokenAddresses,
  getUnderlyingTokenAddresses2,
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
  expect(BoostedPoolMock.address).toBe(
    '0xa13a9247ea42d743238089903570127dda72fe44'
  );

  const rootTokenAddresses = getUnderlyingTokenAddresses(BoostedPoolMock);

  expect(rootTokenAddresses).toEqual([
    '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
    '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
    '0xae37d54ae477268b9997d4161b96b8200755935c',
  ]);

  const rootTokenAddresses2 = getUnderlyingTokenAddresses2(
    BoostedPoolMock.tokens,
    BoostedPoolMock.address
  );

  expect(rootTokenAddresses2).toEqual([
    '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
    '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
    '0xae37d54ae477268b9997d4161b96b8200755935c',
  ]);

  expect(BoostedPoolMock.tokensList).toEqual([
    '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
    '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
    '0xa13a9247ea42d743238089903570127dda72fe44',
    '0xae37d54ae477268b9997d4161b96b8200755935c',
  ]);

  const rootTokenSymbols = BoostedPoolMock.tokens.map(token => token?.symbol);

  expect(rootTokenSymbols).toEqual([
    'bb-a-USDT',
    'bb-a-USDC',
    'bb-a-USD',
    'bb-a-DAI',
  ]);

  // const firstTokenAddress = rootTokenAddresses[0];
  // const firstToken = findTokenInTree(BoostedPoolMock.tokens, firstTokenAddress);
  // expect(firstToken?.symbol).toBe('bb-a-USDT');
  // expect(firstToken?.address).toBe(firstTokenAddress);
  // const firstChildrenTokens = getUnderlyingTokens(
  //   BoostedPoolMock,
  //   firstTokenAddress
  // );
  // expect(firstChildrenTokens.length).toBe(2);
  // expect(firstChildrenTokens[0].symbol).toBe('USDT');
  // expect(firstChildrenTokens[1].symbol).toBe('aUSDT');

  // const secondTokenAddress = rootTokenAddresses[1];
  // const secondToken = findTokenInTree(
  //   BoostedPoolMock.tokens,
  //   secondTokenAddress
  // );
  // expect(secondToken?.symbol).toBe('bb-a-USDC');
  // const secondChildrenTokens = getUnderlyingTokens(
  //   BoostedPoolMock,
  //   secondTokenAddress
  // );
  // expect(secondChildrenTokens.length).toBe(2);
  // expect(secondChildrenTokens[0].symbol).toBe('USDC');
  // expect(secondChildrenTokens[1].symbol).toBe('aUSDC');

  const thirdTokenAddress = rootTokenAddresses[2];
  const thirdToken = findTokenInTree(BoostedPoolMock.tokens, thirdTokenAddress);

  console.log('THIRD TOKEN address: ', thirdToken?.address);
  expect(thirdToken?.symbol).toBe('bb-a-DAI');
  const thirdChildrenTokens = getUnderlyingTokens(
    BoostedPoolMock,
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

test('Find token bb-a-DAI', () => {
  const bbaDaiAddress = '0xae37d54ae477268b9997d4161b96b8200755935c';
  const poolToken = findTokenInTree(BoostedPoolMock.tokens, bbaDaiAddress);

  expect(poolToken?.token.pool?.tokens).toBe(undefined);
});

test('Find array of tokens bb-a-DAI', () => {
  const bbaDaiAddress = '0xae37d54ae477268b9997d4161b96b8200755935c';
  const poolTokens = findTokensInTree(BoostedPoolMock.tokens, bbaDaiAddress);

  expect(poolTokens?.length).toBe(3);
  expect(poolTokens?.[0].token.pool?.tokens).toBe(undefined);
  expect(poolTokens?.[1].token.pool?.tokens).toBeDefined();
  expect(poolTokens?.[2].token.pool?.tokens).toBeDefined();
});

/**
 * Get all unique token tree tokens as flat array.
 *
 * @param {PoolToken[]} tokenTree - A pool's token tree.
 * @param {TokenTreeOpts} options
 * @returns {PoolToken[]} Flat array of tokens in tree.
 */
export function flatTokenTree(
  tokenTree: PoolToken[],
  options: TokenTreeOpts = { includeLinearUnwrapped: false }
): PoolToken[] {
  const tokens: PoolToken[] = [];

  for (const token of tokenTree) {
    tokens.push(token);

    if (token.token.pool?.tokens) {
      if (
        !options.includeLinearUnwrapped &&
        isLinear(token.token.pool.poolType)
      ) {
        tokens.push(token.token.pool.tokens[token.token.pool.mainIndex]);
      } else {
        const nestedTokens = flatTokenTree(token.token.pool?.tokens, options);
        tokens.push(...nestedTokens);
      }
    }
  }

  return tokens
    .filter(
      (v, i, a) => a.findIndex(v2 => isSameAddress(v2.address, v.address)) === i
    )
    .map(token => token.symbol);
}

test.only('TBD', () => {
  expect(
    flatTokenTree(BoostedPoolMock.tokens, { includeLinearUnwrapped: false })
  ).toEqual([
    'bb-a-USDT',
    'USDT',
    'bb-a-USDC',
    'USDC',
    'bb-a-USD',
    'bb-a-DAI',
    'DAI',
  ]);

  expect(
    flatTokenTree(BoostedPoolMock.tokens, { includeLinearUnwrapped: true })
  ).toEqual(['bb-a-USDT']);
});
