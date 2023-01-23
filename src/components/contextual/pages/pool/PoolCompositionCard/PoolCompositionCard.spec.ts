import { BoostedPoolMock } from '@/__mocks__/pool';
import PoolCompositionCard from './PoolCompositionCard.vue';
import { screen, within } from '@testing-library/vue';
import { renderComponent } from '@/tests/renderComponent';

vi.mock('@/providers/tokens.provider');

function renderCard() {
  renderComponent(PoolCompositionCard, {
    props: { pool: BoostedPoolMock },
  });
}

describe('Given a boosted pool with a deep bb-a-DAI linear token, should render correct balance and fiat', () => {
  it('for wrapped tokens (aUSDT)', async () => {
    renderCard();
    const aUSDT = await screen.findByRole('link', {
      name: /aUSDT/i,
    });
    const aUSDTContainer = within(aUSDT.parentElement as HTMLElement);
    await aUSDTContainer.findByText('16,616');
    await aUSDTContainer.findByText('$33,232');
  });

  it('for a non wrapped token (DAI)', async () => {
    renderCard();

    const dai = await screen.findAllByRole('link', { name: /dai/i });

    const aUSDTContainer = within(dai[1].parentElement as HTMLElement);
    await aUSDTContainer.findByText('24,104');
    await aUSDTContainer.findByText('$48,209');
  });
});
