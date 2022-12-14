import { TokenList, TokenListMap } from '@/types/TokenList';
import { mount } from 'vue-composable-tester';
import { getTokensListProvision } from './token-lists.provider';

function firstTokenListSymbols(tokenList: TokenListMap) {
  return Object.values(tokenList)[0].tokens.map(t => t.symbol);
}

function tokenListSymbols(tokenList: TokenList) {
  return tokenList.tokens.map(t => t.symbol);
}

describe('Token lists provider should', () => {
  test('provide active TokenList', async () => {
    const { result } = mount(() => getTokensListProvision());

    expect(firstTokenListSymbols(result.activeTokenLists.value)).toEqual([
      'BAL',
      'DAI',
      'USDT',
      'USDC',
      'WETH',
      'WBTC',
      'miMATIC',
    ]);
  });

  test('provide approved TokenList', async () => {
    const { result } = mount(() => getTokensListProvision());
    expect(firstTokenListSymbols(result.approvedTokenLists.value)).toEqual([
      'BAL',
      'DAI',
      'USDT',
      'USDC',
      'WETH',
      'WBTC',
      'miMATIC',
    ]);
  });

  test('provide balancer TokenList', async () => {
    const { result } = mount(() => getTokensListProvision());
    expect(firstTokenListSymbols(result.balancerTokenLists.value)).toEqual([
      'BAL',
      'DAI',
      'USDT',
      'USDC',
      'WETH',
      'WBTC',
      'miMATIC',
    ]);
  });

  test('provide default TokenList', async () => {
    const { result } = mount(() => getTokensListProvision());
    expect(tokenListSymbols(result.defaultTokenList.value)).toEqual([
      'BAL',
      'DAI',
      'USDT',
      'USDC',
      'WETH',
      'WBTC',
      'miMATIC',
    ]);
  });

  test('provide vetted TokenList', async () => {
    const { result } = mount(() => getTokensListProvision());
    expect(tokenListSymbols(result.vettedTokenList.value)).toEqual([
      'BAL',
      'bb-a-DAI',
      'bb-a-USDC',
      'bb-a-USDT',
      'bb-a-USD',
      'DAI',
      'FEI',
      'GNO',
      'USDT',
      'USDC',
      'WETH',
      'WBTC',
      'aDAI',
      'aUSDC',
      'aUSDT',
    ]);
  });
});
