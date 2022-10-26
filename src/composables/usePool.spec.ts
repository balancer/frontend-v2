import { BoostedPoolMock } from '@/__mocks__/pool';
import { tokenTreeLeafs, tokenTreeNodes } from './usePool';

jest.mock('@/services/rpc-provider/rpc-provider.service');

test('tokenTreeNodes', () => {
  const nodes = tokenTreeNodes(BoostedPoolMock.tokens);
  expect(nodes).toEqual([
    '0x2f4eb100552ef93840d5adc30560e5513dfffacb',
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0xf8fd466f12e236f4c96f7cce6c79eadb819abf58',
    '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0xd093fa4fb80d09bb30817fdcd442d4d02ed3e5de',
    '0xa13a9247ea42d743238089903570127dda72fe44',
    '0xae37d54ae477268b9997d4161b96b8200755935c',
    '0x02d60b84491589974263d922d9cc7a3152618ef6',
    '0x6b175474e89094c44da98b954eedeac495271d0f',
  ]);
});

test('tokenTreeLeafs', () => {
  const leafs = tokenTreeLeafs(BoostedPoolMock.tokens);
  expect(leafs).toEqual([
    '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  ]);
});
