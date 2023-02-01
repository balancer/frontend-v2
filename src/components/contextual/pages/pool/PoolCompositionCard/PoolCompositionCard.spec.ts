import { BoostedPoolMock } from '@/__mocks__/pool';
import { fireEvent, screen, within } from '@testing-library/vue';
import { renderComponent } from '@tests/renderComponent';
import PoolCompositionCard from './PoolCompositionCard.vue';

vi.mock('@/providers/tokens.provider');

function renderCard() {
  renderComponent(PoolCompositionCard, {
    props: { pool: BoostedPoolMock },
  });
}

describe('Given a boosted pool with a deep bb-a-DAI linear token, should render correct balance and fiat', () => {
  async function goToTotalCompositionTab() {
    const totalCompositionTab = screen.getByText(/total composition/i);
    await fireEvent.click(totalCompositionTab);
  }

  it('for wrapped tokens (aUSDT)', async () => {
    renderCard();

    const aUSDT = await screen.findByRole('link', {
      name: /aUSDT/i,
    });
    const aUSDTContainer = within(aUSDT.parentElement as HTMLElement);

    //USER COMPOSITION TAB
    await aUSDTContainer.findByText('167,824');
    await aUSDTContainer.findByText('$335,648');

    //TOTAL COMPOSITION TAB
    await goToTotalCompositionTab();

    await aUSDTContainer.findByText('16,616');
    await aUSDTContainer.findByText('$33,232');
  });

  it('for a non wrapped token (DAI)', async () => {
    renderCard();

    const dai = await screen.findAllByRole('link', { name: /dai/i });
    const aUSDTContainer = within(dai[1].parentElement as HTMLElement);

    //USER COMPOSITION TAB
    await aUSDTContainer.findByText('243,454');
    await aUSDTContainer.findByText('$486,908');

    //TOTAL COMPOSITION TAB
    await goToTotalCompositionTab();
    await aUSDTContainer.findByText('24,104');
    await aUSDTContainer.findByText('$48,209');
  });
});
