import { render, fireEvent } from '@testing-library/vue';
import ClaimRewardsBtn from './ClaimRewardsBtn.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import gauge from '@/services/balancer/gauges/__mocks__/decorated-gauge.schema.json';
import LiquidityGauge, { mockClaimRewards } from '@/services/balancer/contracts/contracts/liquidity-gauge';

ClaimRewardsBtn.components = { BalBtn };

jest.mock('@/composables/useTransactions');
jest.mock('@/composables/useTokens');
jest.mock('@/composables/useEthers');
jest.mock('@/composables/queries/useGaugesQuery');
jest.mock('@/composables/queries/useGaugesDecorationQuery');
jest.mock('@/services/web3/useWeb3');
jest.mock('@/services/balancer/contracts/contracts/liquidity-gauge');
jest.mock('vue-i18n');

describe.only('ClaimRewardsBtn', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    // @ts-ignore
    LiquidityGauge.mockClear();
    mockClaimRewards.mockClear();
  });

  it('should render props', () => {
    const { getByText } = render(ClaimRewardsBtn, {
      props: {
        gauge,
        value: '1000'
      }
    });

    expect(getByText('Claim all')).toBeVisible();
  });

  it('Calls LiquidityGauge.claimRewards on click', async () => {
    const { getByText } = render(ClaimRewardsBtn, {
      props: {
        gauge,
        value: '1000'
      }
    });

    const btn = getByText('Claim all');

    await fireEvent.click(btn);

    // const mockLiquidityGauge = require('@/services/balancer/contracts/contracts/liquidity-gauge')
    //   .mock.instances[0];
    // @ts-ignore
    expect(LiquidityGauge.mock.instances[0].claimRewards).toBeCalled();
  });
});
