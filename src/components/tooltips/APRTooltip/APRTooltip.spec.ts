import { render, screen } from '@testing-library/vue';
import { Pool } from '@/services/pool/types';
import { AprBreakdown } from '@balancer-labs/sdk';
import { EmptyPoolMock } from '@/__mocks__/pool';

import APRTooltip from './APRTooltip.vue';

const EmptyAprBreakdownMock: AprBreakdown = {
  swapFees: 0,
  tokenAprs: {
    total: 0,
    breakdown: {},
  },
  stakingApr: {
    min: 0,
    max: 0,
  },
  rewardAprs: {
    total: 0,
    breakdown: {},
  },
  protocolApr: 0,
  min: 0,
  max: 0,
};

describe('APRTooltip', () => {
  it('Should render a single swap fee value for pools without staking', () => {
    const aprBreakdown: AprBreakdown = {
      ...EmptyAprBreakdownMock,
      swapFees: 1522,
      min: 1522,
      max: 1522,
    };
    const { container } = render(APRTooltip, {
      props: {
        pool: EmptyPoolMock,
        poolApr: aprBreakdown,
      },
    });
    expect(container.getElementsByClassName('total-apr').length).toBe(1);
    expect(container.getElementsByClassName('total-apr')[0].textContent).toBe(
      'Total APR15.22%'
    );
    expect(container.getElementsByClassName('swap-fee-apr').length).toBe(1);
    expect(
      container.getElementsByClassName('swap-fee-apr')[0].textContent
    ).toBe('15.22% Swap fees APR');
  });

  it('Should render an apr range for a pool with staking', () => {
    const aprBreakdown: AprBreakdown = {
      ...EmptyAprBreakdownMock,
      stakingApr: {
        min: 44,
        max: 567,
      },
      min: 44,
      max: 567,
    };
    const { container } = render(APRTooltip, {
      props: {
        pool: EmptyPoolMock,
        poolApr: aprBreakdown,
      },
    });
    expect(container.getElementsByClassName('total-apr').length).toBe(1);
    expect(container.getElementsByClassName('total-apr')[0].textContent).toBe(
      'Total APR0.44% - 5.67%'
    );
    expect(container.getElementsByClassName('swap-fee-apr').length).toBe(1);
    expect(
      container.getElementsByClassName('swap-fee-apr')[0].textContent
    ).toBe('15.22% Swap fees APR');
  });
});
