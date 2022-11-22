import { TokenList, TokenListMap } from '@/types/TokenList';
import { render, screen } from '@testing-library/vue';
import TokenListsProvider from './token-lists.provider';
import useTokenLists from '@/composables/useTokenLists';
import { h } from 'vue';

function renderWithTokenListProvider(componentUnderTest) {
  render(TokenListsProvider, {
    slots: { default: () => h(componentUnderTest) },
  });
}

function renderFirstTokenListSymbols(tokenList: TokenListMap) {
  return JSON.stringify(Object.values(tokenList)[0].tokens.map(t => t.symbol));
}
function renderTokenListSymbols(tokenList: TokenList) {
  return JSON.stringify(tokenList.tokens.map(t => t.symbol));
}

describe('Token lists provider should', () => {
  test('provide active TokenList', async () => {
    const ComponentUnderTest = {
      setup() {
        const { activeTokenLists } = useTokenLists();

        return () => `${renderFirstTokenListSymbols(activeTokenLists.value)}`;
      },
    };

    renderWithTokenListProvider(ComponentUnderTest);
    await screen.findByText(
      '["BAL","DAI","USDT","USDC","WETH","WBTC","miMATIC"]'
    );
  });

  test('provide approved TokenList', async () => {
    const ComponentUnderTest = {
      setup() {
        const { approvedTokenLists } = useTokenLists();

        return () => `${renderFirstTokenListSymbols(approvedTokenLists.value)}`;
      },
    };
    renderWithTokenListProvider(ComponentUnderTest);
    await screen.findByText(
      '["BAL","DAI","USDT","USDC","WETH","WBTC","miMATIC"]'
    );
  });

  test('provide balancer TokenList', async () => {
    const ComponentUnderTest = {
      setup() {
        const { balancerTokenLists } = useTokenLists();

        return () => `${renderFirstTokenListSymbols(balancerTokenLists.value)}`;
      },
    };
    renderWithTokenListProvider(ComponentUnderTest);
    await screen.findByText(
      '["BAL","DAI","USDT","USDC","WETH","WBTC","miMATIC"]'
    );
  });

  test('provide default TokenList', async () => {
    const ComponentUnderTest = {
      setup() {
        const { defaultTokenList } = useTokenLists();

        return () => `${renderTokenListSymbols(defaultTokenList.value)}`;
      },
    };
    renderWithTokenListProvider(ComponentUnderTest);
    await screen.findByText(
      '["BAL","DAI","USDT","USDC","WETH","WBTC","miMATIC"]'
    );
  });

  test('provide vetted TokenList', async () => {
    const ComponentUnderTest = {
      setup() {
        const { vettedTokenList } = useTokenLists();

        return () => `${renderTokenListSymbols(vettedTokenList.value)}`;
      },
    };
    renderWithTokenListProvider(ComponentUnderTest);
    await screen.findByText(
      '["BAL","bb-a-DAI","bb-a-USDC","bb-a-USDT","bb-a-USD","DAI","FEI","GNO","USDT","USDC","WETH","WBTC","aDAI","aUSDC","aUSDT"]'
    );
  });
});
