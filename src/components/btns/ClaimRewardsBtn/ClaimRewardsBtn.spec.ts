import { fireEvent, render } from '@testing-library/vue';

import { txResponseMock } from '@/__mocks__/transactions';
import gauge from '@/services/balancer/gauges/__mocks__/decorated-gauge.schema.json';

import ClaimRewardsBtn from './ClaimRewardsBtn.vue';

vi.mock('@/composables/useTransactions');
vi.mock('@/composables/useEthers');
vi.mock('@/composables/queries/useGaugesQuery');
vi.mock('@/composables/queries/useGaugesDecorationQuery');
vi.mock('@/services/web3/useWeb3');
vi.mock('@/services/rpc-provider/rpc-provider.service');

const mockClaimRewards = vi.fn().mockResolvedValue(txResponseMock);
vi.mock('@/services/balancer/contracts/contracts/liquidity-gauge', () => {
  return {
    LiquidityGauge: vi.fn().mockImplementation(() => {
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
