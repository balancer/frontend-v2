import { render } from '@testing-library/vue';
import { AprBreakdown } from '@balancer-labs/sdk';
import { EmptyPoolMock } from '@/__mocks__/pool';

import APRTooltip from './APRTooltip.vue';
import { Pool } from '@/services/pool/types';
import { configService } from '@/services/config/config.service';
import { POOLS } from '@/constants/pools';

jest.mock('@/composables/useTokens');

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
  describe('Swap Fees', () => {
    it('Should render a single swap fee value for pools without staking', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        swapFees: 1522,
        min: 1522,
        max: 1522,
      };
      const { getByTestId } = render(APRTooltip, {
        props: {
          pool: EmptyPoolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr')).toBeTruthy();
      expect(getByTestId('total-apr').textContent).toBe('Total APR15.22%');
      expect(getByTestId('swap-fee-apr')).toBeTruthy();
      expect(getByTestId('swap-fee-apr').textContent).toBe(
        '15.22% Swap fees APR'
      );
    });
  });

  describe('Protocol APR', () => {
    it('Should show veBAL locking rewards', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        swapFees: 78,
        protocolApr: 117,
        min: 78,
        max: 195,
      };
      const poolMock: Pool = {
        ...EmptyPoolMock,
        id: POOLS.IdsMap?.veBAL || '',
      };
      console.log('POOL ID: ', poolMock.id);
      const { getByTestId } = render(APRTooltip, {
        props: {
          pool: poolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe(
        'Total APR0.78% - 1.95%'
      );
      expect(getByTestId('protocol-apr').textContent).toContain(
        '1.17% Max locking/veBAL APR'
      );
    });
  });

  describe('Staking Rewards', () => {
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
      const { getByTestId } = render(APRTooltip, {
        props: {
          pool: EmptyPoolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe(
        'Total APR0.44% - 5.67%'
      );
      expect(getByTestId('swap-fee-apr').textContent).toBe(
        '0.00% Swap fees APR'
      );
      expect(
        getByTestId('staking-apr').children[0].children[0].textContent
      ).toBe('0.44% Min staking APR');
      expect(
        getByTestId('staking-apr').children[0].children[1].children[0]
          .textContent
      ).toBe('0.44% Min BAL APR');
      expect(
        getByTestId('staking-apr').children[0].children[1].children[1]
          .textContent
      ).toBe('5.67% Max BAL APR');
    });

    it('Should show swap fees and staking rewards', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        swapFees: 223,
        stakingApr: {
          min: 48,
          max: 555,
        },
        min: 271,
        max: 778,
      };
      const { getByTestId } = render(APRTooltip, {
        props: {
          pool: EmptyPoolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe(
        'Total APR2.71% - 7.78%'
      );
      expect(getByTestId('swap-fee-apr').textContent).toBe(
        '2.23% Swap fees APR'
      );
      expect(
        getByTestId('staking-apr').children[0].children[0].textContent
      ).toBe('0.48% Min staking APR');
      expect(
        getByTestId('staking-apr').children[0].children[1].children[0]
          .textContent
      ).toBe('0.48% Min BAL APR');
      expect(
        getByTestId('staking-apr').children[0].children[1].children[1]
          .textContent
      ).toBe('5.55% Max BAL APR');
    });
  });

  describe('Token Aprs', () => {
    it('Should show stETH staking reward APRs', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        tokenAprs: {
          total: 166,
          breakdown: {
            '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': 166,
          },
        },
        min: 166,
        max: 166,
      };
      const poolMock: Pool = {
        ...EmptyPoolMock,
        tokensList: [configService.network.addresses.wstETH],
      };
      const { getByTestId } = render(APRTooltip, {
        props: {
          pool: poolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe('Total APR1.66%');
      expect(getByTestId('yield-apr').textContent).toBe(
        '1.66% stETH staking rewards APR'
      );
    });
  });
});
