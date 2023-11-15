import { mountComposable } from '@tests/mount-helpers';
import { TokenList, TokenListMap } from '@/types/TokenList';
import { useTokenLists } from '@/providers/token-lists.provider';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';

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

initDependenciesWithDefaultMocks();

describe('Token lists provider should', () => {
  test('provide active TokenList', async () => {
    const { result } = mountComposableWithTokenLists();
    await result.tokensListPromise;

    expect(firstTokenListSymbols(result.activeTokenLists.value)).toEqual([
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
      'GRO',
    ]);
  });

  test('provide balancer TokenList', async () => {
    const { result } = mountComposableWithTokenLists();
    expect(tokenListSymbols(result.balancerTokenList.value)).toEqual([
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
      'GRO',
    ]);
  });
});
