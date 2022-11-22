import { TokenList, TokenListMap } from '@/types/TokenList';
import { render, screen } from '@testing-library/vue';
import TokenListsProvider from './token-lists.provider';
import useTokenLists from '@/composables/useTokenLists';
import { computed, h, ComputedRef } from 'vue';

function renderWithTokenListProvider(componentUnderTest) {
  render(TokenListsProvider, {
    slots: { default: () => h(componentUnderTest) },
  });
}

const tokenListSymbols = (tokenList: ComputedRef<TokenList>) =>
  computed(() => {
    if (!tokenList.value) return [];
    return JSON.stringify(tokenList.value.tokens.map(t => t.symbol));
  });

const firstTokenListSymbols = (activeTokenLists: ComputedRef<TokenListMap>) =>
  computed(() => {
    const lists = Object.values(activeTokenLists.value);
    if (!lists.length) return [];
    return JSON.stringify(lists[0].tokens.map(t => t.symbol));
  });

describe('Token lists provider should', () => {
  test('provide active TokenList', async () => {
    const ComponentUnderTest = {
      setup() {
        const { activeTokenLists } = useTokenLists();

        return () => `${firstTokenListSymbols(activeTokenLists).value}`;
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

        return () => `${firstTokenListSymbols(approvedTokenLists).value}`;
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

        return () => `${firstTokenListSymbols(balancerTokenLists).value}`;
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

        return () => `${tokenListSymbols(defaultTokenList).value}`;
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

        return () => `${tokenListSymbols(vettedTokenList).value}`;
      },
    };
    renderWithTokenListProvider(ComponentUnderTest);
    await screen.findByText(
      '["BAL","bb-a-DAI","bb-a-USDC","bb-a-USDT","bb-a-USD","DAI","FEI","GNO","USDT","USDC","WETH","WBTC","aDAI","aUSDC","aUSDT"]'
    );
  });
});
