import BalLink from '@/components/_global/BalLink/BalLink.vue';
import BalAsset from '@/components/_global/BalAsset/BalAsset.vue';
import { BoostedPoolMock } from '@/__mocks__/pool';
import PoolCompositionCard from './PoolCompositionCard.vue';
import { render, screen, within } from '@testing-library/vue';

// TODO: refactor providers to avoid mocking useTokens
jest.mock('@/composables/useTokens');
jest.mock('@/services/web3/useWeb3');

function renderComponent() {
  render(PoolCompositionCard, {
    props: { pool: BoostedPoolMock },
    global: {
      components: {
        // TODO: refactor tests to use registerComponents without warnings
        BalAsset,
        BalLink,
      },
    },
  });
}

describe('Given a boosted pool with a deep bb-a-DAI linear token, should render correct balance and fiat', () => {
  it.only('for wrapped tokens (aUSDT)', async () => {
    renderComponent();
    const aUSDT = await screen.findByRole('link', {
      name: /aUSDT/i,
    });
    const aUSDTContainer = within(aUSDT.parentElement as HTMLElement);
    await aUSDTContainer.findByText('16,616');
    await aUSDTContainer.findByText('$33,232');
  });

  it('for a non wrapped token (DAI)', async () => {
    renderComponent();

    const dai = await screen.findAllByRole('link', { name: /dai/i });

    const aUSDTContainer = within(dai[1].parentElement as HTMLElement);
    await aUSDTContainer.findByText('24,104');
    await aUSDTContainer.findByText('$48,209');
  });
});
