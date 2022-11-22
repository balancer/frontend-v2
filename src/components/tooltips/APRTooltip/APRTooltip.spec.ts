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
      const { getByTestId } = render(APRTooltip, {
        props: {
          pool: poolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe(
        'Total APR0.78% - 1.95%'
      );
      expect(getByTestId('vebal-apr').textContent).toContain(
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

    it('Should show rETH staking reward APRs', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        swapFees: 29,
        tokenAprs: {
          total: 73,
          breakdown: {
            '0xae78736cd615f374d3085123a210448e74fc6393': 73,
          },
        },
        min: 102,
        max: 102,
      };
      const poolMock: Pool = {
        ...EmptyPoolMock,
        tokensList: [configService.network.addresses.rETH],
      };
      const { getByTestId } = render(APRTooltip, {
        props: {
          pool: poolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe('Total APR1.02%');
      expect(getByTestId('yield-apr').textContent).toBe(
        '0.73% rETH staking rewards APR'
      );
    });

    it('Should show a breakdown of a boosted pools linear pool APRs and staking rewards', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        swapFees: 14,
        tokenAprs: {
          total: 131,
          breakdown: {
            '0x2F4eb100552ef93840d5aDC30560E5513DFfFACb': 115,
            '0x82698aeCc9E28e9Bb27608Bd52cF57f704BD1B83': 4,
            '0xae37D54Ae477268B9997d4161B96b8200755935c': 12,
          },
        },
        stakingApr: {
          min: 30,
          max: 75,
        },
        min: 175,
        max: 220,
      };
      const poolMock: Pool = {
        ...EmptyPoolMock,
        id: '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d',
        tokensList: [
          '0x2F4eb100552ef93840d5aDC30560E5513DFfFACb',
          '0x82698aeCc9E28e9Bb27608Bd52cF57f704BD1B83',
          '0xae37D54Ae477268B9997d4161B96b8200755935c',
        ],
      };
      const { getByTestId } = render(APRTooltip, {
        props: {
          pool: poolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe(
        'Total APR1.75% - 2.20%'
      );
      const yieldAprBreakdown = getByTestId('yield-apr').children[0];
      expect(yieldAprBreakdown.children[0].textContent).toBe(
        '1.31% Boosted APR'
      );
      expect(yieldAprBreakdown.children[1].children[0].textContent).toBe(
        '1.15% bb-a-USDT APR'
      );
      expect(yieldAprBreakdown.children[1].children[1].textContent).toBe(
        '0.04% bb-a-USDC APR'
      );
      expect(yieldAprBreakdown.children[1].children[2].textContent).toBe(
        '0.12% bb-a-DAI APR'
      );
      expect(
        getByTestId('staking-apr').children[0].children[0].textContent
      ).toBe('0.30% Min staking APR');
      expect(
        getByTestId('staking-apr').children[0].children[1].children[0]
          .textContent
      ).toBe('0.30% Min BAL APR');
      expect(
        getByTestId('staking-apr').children[0].children[1].children[1]
          .textContent
      ).toBe('0.75% Max BAL APR');
    });

    it('Should show boosted staking rewards as a line item for pools that contain a boosted pool', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        tokenAprs: {
          total: 28,
          breakdown: {
            '0xa13a9247ea42d743238089903570127dda72fe44': 28,
          },
        },
        stakingApr: {
          min: 567,
          max: 1418,
        },
        min: 595,
        max: 1446,
      };
      const { getByTestId } = render(APRTooltip, {
        props: {
          pool: EmptyPoolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe(
        'Total APR5.95% - 14.46%'
      );
      expect(getByTestId('yield-apr').textContent).toBe('0.28% Boosted APR');
      expect(
        getByTestId('staking-apr').children[0].children[0].textContent
      ).toBe('5.67% Min staking APR');
      expect(
        getByTestId('staking-apr').children[0].children[1].children[0]
          .textContent
      ).toBe('5.67% Min BAL APR');
      expect(
        getByTestId('staking-apr').children[0].children[1].children[1]
          .textContent
      ).toBe('14.18% Max BAL APR');
    });

    it('Should show veBAL staking rewards as a line item for pools that contain the 80/20 veBAL pool', () => {
      const veBalPoolAddress = POOLS.IdsMap?.veBAL?.slice(0, 42) || '';
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        tokenAprs: {
          total: 17,
          breakdown: {
            [veBalPoolAddress]: 17,
          },
        },
        min: 17,
        max: 17,
      };
      const { getByTestId } = render(APRTooltip, {
        props: {
          pool: EmptyPoolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe('Total APR0.17%');
      expect(getByTestId('yield-apr').textContent).toBe('0.17% veBAL APR');
    });
  });
});
