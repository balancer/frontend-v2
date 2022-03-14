import { render, fireEvent } from '@testing-library/vue';
import ClaimRewardsBtn from './ClaimRewardsBtn.vue';
import TxActionBtn from '../TxActionBtn/TxActionBtn.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import gauge from '@/services/balancer/gauges/__mocks__/decorated-gauge.schema.json';
import { txResponseMock } from '@/__mocks__/transactions';

ClaimRewardsBtn.components = { TxActionBtn };
TxActionBtn.components = { BalBtn };

jest.mock('@/services/balancer/contracts/contracts/liquidity-gauge');
jest.mock('@/composables/useTransactions');
jest.mock('@/composables/useTokens');
jest.mock('@/composables/useEthers');
jest.mock('@/composables/useNumbers');
jest.mock('@/composables/queries/useGaugesQuery');
jest.mock('@/composables/queries/useGaugesDecorationQuery');
jest.mock('@/services/web3/useWeb3');
jest.mock('@/services/rpc-provider/rpc-provider.service');
jest.mock('vue-i18n');

const mockClaimRewards = jest.fn().mockResolvedValue(txResponseMock);
jest.mock('@/services/balancer/contracts/contracts/liquidity-gauge', () => {
  return {
    LiquidityGauge: jest.fn().mockImplementation(() => {
      return {
        claimRewards: mockClaimRewards
      };
    })
  };
});

describe.only('ClaimRewardsBtn', () => {
  beforeEach(() => {
    mockClaimRewards.mockClear();
  });

  it('should render props', () => {
    const { getByText } = render(ClaimRewardsBtn, {
      props: {
        gauge,
        fiatValue: '1000'
      }
    });

    expect(getByText('Claim all')).toBeVisible();
  });

  it('Calls LiquidityGauge.claimRewards on click', async () => {
    const { getByText } = render(ClaimRewardsBtn, {
      props: {
        gauge,
        fiatValue: '1000'
      }
    });

    const btn = getByText('Claim all');

    await fireEvent.click(btn);

    expect(mockClaimRewards).toBeCalled();
  });
});
