import { screen } from '@testing-library/vue';

import BalAssetSet from '@/components/_global/BalAsset/BalAssetSet.vue';

import { mockExpiredGauges } from '@/composables/queries/__mocks__/useExpiredGaugesQuery';
import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import { renderComponent } from '@tests/renderComponent';
import { aVotingPool } from '../MultiVoting/voting-pool.builders';
import GaugesTable from './GaugesTable.vue';
import {
  VotingProviderSymbol,
  votingProvider,
} from '../providers/voting.provider';

GaugesTable.components = {
  BalAssetSet,
};

vi.mock('@/composables/queries/useGraphQuery', () => {
  return {
    default: () => ({
      data: {
        value: {
          votingEscrowLocks: [
            {
              votingEscrowID: {
                id: 'asdf',
              },
              updatedAt: 123,
            },
          ],
        },
      },
    }),
    subgraphs: {
      gauge: 'mockgauge',
    },
  };
});

vi.mock('@/composables/queries/useVeBalLockInfoQuery', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        data: {
          value: {
            lockedAmount: '123',
          },
        },
      };
    }),
  };
});

vi.mock('@/composables/queries/useVotingPoolsQuery');
// Global settings for component render.
const global = {
  stubs: {
    TimelockIcon: true,
  },
};

const gaugeId = '0x34f33CDaED8ba0E1CEECE80e5f4a73bcf234cfac';
vi.mock('vue-router');
vi.mock('@/providers/tokens.provider');
vi.mock('@/composables/queries/useExpiredGaugesQuery');

const pool: VotingPool = aVotingPool({
  gauge: {
    address: gaugeId,
    isKilled: false,
  },
});

const votingPools: VotingPool[] = [pool];

const queryExpiredLabel = () => screen.queryByText(/Expired/i);
const queryRemoveVotesBtn = () =>
  screen.queryByRole('button', { name: /Remove/i });

const votingProviderPlugin = {
  install(app) {
    app.provide(VotingProviderSymbol, votingProvider());
  },
};

describe('GaugesTable', () => {
  it('should render right tokens for gauge', async () => {
    renderComponent(
      GaugesTable,
      {
        global,
        props: {
          data: votingPools,
          renderedRowsIdx: 0,
          selectVotesDisabled: false,
        },
      },
      votingProviderPlugin
    );
    const usdt = await screen.findByText('USDT');
    const usdc = await screen.findByText('USDC');
    const expiredLabel = queryExpiredLabel();

    expect(usdt).toBeVisible();
    expect(usdc).toBeVisible();
    expect(expiredLabel).not.toBeInTheDocument();
  });

  it('should render Expired label and disabled Vote btn, if gauge is expired', async () => {
    mockExpiredGauges([gaugeId]);

    renderComponent(
      GaugesTable,
      {
        global,
        props: {
          data: votingPools,
          renderedRowsIdx: 0,
          selectVotesDisabled: false,
        },
      },
      votingProviderPlugin
    );

    const expiredLabel = queryExpiredLabel();
    const removeVotesBtn = queryRemoveVotesBtn();

    expect(expiredLabel).toBeVisible();
    expect(removeVotesBtn).not.toBeInTheDocument();
  });
});
