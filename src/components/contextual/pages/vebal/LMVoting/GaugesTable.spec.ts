import { render, screen } from '@testing-library/vue';

import BalAssetSet from '@/components/_global/BalAsset/BalAssetSet.vue';

import GaugesTable from './GaugesTable.vue';
GaugesTable.components = {
  BalAssetSet,
};

jest.mock('@/composables/useTokens');
jest.mock('@/services/web3/useWeb3', () => {
  return jest.fn().mockImplementation(() => {
    return {
      isWalletReady: new Proxy(
        {},
        {
          get() {
            return true;
          },
        }
      ),
      account: '0x0000000000000000000000000000000000000000',
    };
  });
});

const gaugeId = '0x34f33CDaED8ba0E1CEECE80e5f4a73bcf234cfac';

const gauge = {
  address: gaugeId,
  network: 1,
  pool: {
    id: '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063',
    address: '0x06Df3b2bbB68adc8B0e302443692037ED9f91b42',
    poolType: 'Stable',
    symbol: 'staBAL2',
    tokens: [
      {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        weight: 'null',
        symbol: 'USDC',
        token: { pool: null },
      },
      {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        weight: 'null',
        symbol: 'USDT',
        token: { pool: null },
      },
    ],
  },
  tokenLogoURIs: {
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48':
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7':
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
  },
  votes: '8212341531532800',
  votesNextPeriod: '6934407282299320',
  userVotes: '0',
  lastUserVoteTime: 0,
};

const expiredGauges = [gaugeId];
const gauges = [gauge];

const queryExpiredLabel = () => screen.queryByText(/Expired/i);
const queryVoteBtn = () => screen.queryByRole('button', { name: /Vote/i });
const queryRemoveVotesBtn = () =>
  screen.queryByRole('button', { name: /Remove/i });

describe('GaugesTable', () => {
  it('should render right tokens for gauge', async () => {
    render(GaugesTable, {
      props: {
        data: gauges,
      },
    });
    const usdt = await screen.findByText('USDT');
    const usdc = await screen.findByText('USDC');
    const expiredLabel = queryExpiredLabel();
    const voteBtn = queryVoteBtn();
    const removeVotesBtn = queryRemoveVotesBtn();

    expect(usdt).toBeVisible();
    expect(usdc).toBeVisible();
    expect(expiredLabel).not.toBeInTheDocument();
    expect(removeVotesBtn).not.toBeInTheDocument();
    expect(voteBtn).toBeEnabled();
  });

  it('should render Expired label and disabled Vote btn, if gauge is expired', async () => {
    render(GaugesTable, {
      props: {
        expiredGauges,
        data: gauges,
      },
    });

    const expiredLabel = queryExpiredLabel();
    const voteBtn = queryVoteBtn();
    const removeVotesBtn = queryRemoveVotesBtn();

    expect(expiredLabel).toBeVisible();
    expect(removeVotesBtn).not.toBeInTheDocument();
    expect(voteBtn).toBeDisabled();
  });

  it("should render Expired label and Remove Votes btn if gauge is expired and it has user's votes", async () => {
    render(GaugesTable, {
      props: {
        expiredGauges,
        data: [{ ...gauge, userVotes: '1' }],
      },
    });

    const expiredLabel = queryExpiredLabel();
    const voteBtn = queryVoteBtn();
    const removeVotesBtn = queryRemoveVotesBtn();

    expect(expiredLabel).toBeVisible();
    expect(removeVotesBtn).toBeEnabled();
    expect(voteBtn).not.toBeInTheDocument();
  });
});
