import useTokens from '@/composables/useTokens';
import vueQuery from '@/plugins/vueQuery';
import { TokenInfoMap } from '@/types/TokenList';
import { render, screen } from '@testing-library/vue';
import { renderWithRootProviders } from '@tests/unit/vitest/utils/provider-test-helpers';
import { computed, ComputedRef } from 'vue';

vi.mock('@/services/web3/useWeb3');
vi.mock('@/composables/useEthers');

function renderWithProviders(componentUnderTest) {
  render(renderWithRootProviders(componentUnderTest), {
    global: {
      plugins: [vueQuery],
    },
  });
}

const tokenSymbols = (tokens: ComputedRef<TokenInfoMap>) =>
  computed(() => {
    const values = Object.values(tokens.value);
    if (!values.length) return [];
    return JSON.stringify(values.map(t => t.symbol));
  });

describe('Tokens provider should', () => {
  test('provide main tokens', async () => {
    const ComponentUnderTest = {
      setup() {
        const { tokens } = useTokens();

        return () => `${tokenSymbols(tokens).value}`;
      },
    };

    renderWithProviders(ComponentUnderTest);

    await screen.findByText(
      '["BAL","DAI","USDT","USDC","WETH","WBTC","miMATIC","ETH"]'
    );
  });
});
