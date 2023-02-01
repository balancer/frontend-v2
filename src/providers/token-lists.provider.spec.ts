import { mountComposable } from '@tests/mount-helpers';
import { TokenList, TokenListMap } from '@/types/TokenList';
import { useTokenLists } from '@/providers/token-lists.provider';

function firstTokenListSymbols(tokenList: TokenListMap) {
  return Object.values(tokenList)[0].tokens.map(t => t.symbol);
}

function tokenListSymbols(tokenList: TokenList) {
  return tokenList.tokens.map(t => t.symbol);
}

function mountComposableWithTokenLists() {
  return mountComposable(() => {
    return useTokenLists();
  });
}

describe('Token lists provider should', () => {
  test('provide active TokenList', async () => {
    const { result } = mountComposableWithTokenLists();
    await result.tokensListPromise;
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
    const { result } = mountComposableWithTokenLists();
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
    const { result } = mountComposableWithTokenLists();
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
    const { result } = mountComposableWithTokenLists();
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
    const { result } = mountComposableWithTokenLists();
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
