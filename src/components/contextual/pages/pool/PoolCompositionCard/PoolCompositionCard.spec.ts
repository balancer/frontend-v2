import { BoostedPoolMock } from '@/__mocks__/pool';
import { fireEvent, screen, within } from '@testing-library/vue';
import { renderComponent } from '@tests/renderComponent';
import PoolCompositionCard from './PoolCompositionCard.vue';

//TODO: Find clearer and safer way to inject this providers
vi.mock('@/providers/tokens.provider');
vi.mock('@/composables/useUserPoolPercentage');

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
    await aUSDTContainer.findByText('249.2435');
    await aUSDTContainer.findByText('$498.49');
    await aUSDTContainer.findByText('28.45%');

    //TOTAL COMPOSITION TAB
    await goToTotalCompositionTab();

    await aUSDTContainer.findByText('16,616');
    await aUSDTContainer.findByText('$33,232');
    await aUSDTContainer.findByText('28.45%');
  });

  it('for a non wrapped token (DAI)', async () => {
    renderCard();

    const dai = await screen.findAllByRole('link', { name: /dai/i });
    const aUSDTContainer = within(dai[1].parentElement as HTMLElement);

    //USER COMPOSITION TAB
    await aUSDTContainer.findByText('361.5652');
    await aUSDTContainer.findByText('$723.13');
    await aUSDTContainer.findByText('41.26%');

    //TOTAL COMPOSITION TAB
    await goToTotalCompositionTab();
    await aUSDTContainer.findByText('24,104');
    await aUSDTContainer.findByText('$48,209');
    await aUSDTContainer.findByText('41.26%');
  });
});
