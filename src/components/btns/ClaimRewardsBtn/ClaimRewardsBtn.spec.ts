import { fireEvent, render } from '@testing-library/vue';

import { txResponseMock } from '@/__mocks__/transactions';
import gauge from '@/services/balancer/gauges/__mocks__/decorated-gauge.schema.json';

import ClaimRewardsBtn from './ClaimRewardsBtn.vue';

jest.mock('@/services/balancer/contracts/contracts/liquidity-gauge');
jest.mock('@/composables/useTransactions');
jest.mock('@/composables/useEthers');
jest.mock('@/composables/queries/useGaugesQuery');
jest.mock('@/composables/queries/useGaugesDecorationQuery');
jest.mock('@/services/web3/useWeb3');
jest.mock('@/services/rpc-provider/rpc-provider.service');

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
