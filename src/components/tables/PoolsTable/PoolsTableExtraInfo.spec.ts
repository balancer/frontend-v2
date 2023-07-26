import { screen } from '@testing-library/vue';
import { renderComponent } from '@tests/renderComponent';
import PoolsTableExtraInfo from './PoolsTableExtraInfo.vue';
import { Pool } from '@/services/pool/types';
import { aPool } from '@tests/unit/builders/pool.builders';
import { boostedPoolId } from '@/lib/config/goerli/pools';

function renderInfo(pool: Pool) {
  renderComponent(PoolsTableExtraInfo, {
    props: {
      pool,
    },
  });
}

test('Renders boosted pool button with boosted chip', () => {
  renderInfo(aPool({ id: boostedPoolId }));

  expect(screen.getByRole('button', { name: 'Boosted' })).toBeInTheDocument();
  expect(screen.getByTestId('feature-chip')).toBeInTheDocument();
});

test('Renders NEW pool chip', () => {
  renderInfo(aPool({ isNew: true }));

  expect(
    screen.queryByRole('button', { name: 'Boosted' })
  ).not.toBeInTheDocument();

  expect(screen.getByText(/New/i)).toBeInTheDocument();
});
