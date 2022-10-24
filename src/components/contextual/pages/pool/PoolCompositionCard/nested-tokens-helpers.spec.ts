import { poolWith3NestedLevels } from '@/tests/builders/pools.builders';
import {
  findTokenByAddress,
  getUnderlyingTokens,
} from './nested-token-helpers';

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
