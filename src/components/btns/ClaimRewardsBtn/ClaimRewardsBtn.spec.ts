import { fireEvent, render } from '@testing-library/vue';
import { config } from '@vue/test-utils';

import { txResponseMock } from '@/__mocks__/transactions';
import gauge from '@/services/balancer/gauges/__mocks__/decorated-gauge.schema.json';

import ClaimRewardsBtn from './ClaimRewardsBtn.vue';
import Web3Plugin from '@/services/web3/web3.plugin';
import blocknative from '@/plugins/blocknative';

//TODO: understand why doing this from jest.setup-suite.jsdom.js leads to errors in other tests
config.global.plugins.push(Web3Plugin, blocknative);

const mockClaimRewards = jest.fn().mockResolvedValue(txResponseMock);
jest.mock('@/services/balancer/contracts/contracts/liquidity-gauge', () => {
  return {
    LiquidityGauge: jest.fn().mockImplementation(() => {
      return {
        claimRewards: mockClaimRewards,
      };
    }),
  };
});

describe('ClaimRewardsBtn', () => {
  beforeEach(() => {
    mockClaimRewards.mockClear();
  });

  it('should render props', () => {
    const { getByText } = render(ClaimRewardsBtn, {
      props: {
        gauge,
        fiatValue: '1000',
      },
    });
    expect(getByText('Claim all')).toBeVisible();
  });

  it('Calls LiquidityGauge.claimRewards on click', async () => {
    const { getByText } = render(ClaimRewardsBtn, {
      props: {
        gauge,
        fiatValue: '1000',
      },
    });

    const btn = getByText('Claim all');

    await fireEvent.click(btn);

    expect(mockClaimRewards).toBeCalled();
  });
});
