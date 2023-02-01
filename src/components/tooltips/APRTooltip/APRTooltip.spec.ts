import { AprBreakdown } from '@balancer-labs/sdk';
import { EmptyPoolMock } from '@/__mocks__/pool';

import APRTooltip from './APRTooltip.vue';
import { Pool } from '@/services/pool/types';
import { configService } from '@/services/config/config.service';
import { POOLS } from '@/constants/pools';
import { renderComponent } from '@tests/renderComponent';

vi.mock('@/providers/tokens.provider');

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
      const { getByTestId } = renderComponent(APRTooltip, {
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
      const { getByTestId } = renderComponent(APRTooltip, {
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
      const { getByTestId } = renderComponent(APRTooltip, {
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
      const { getByTestId } = renderComponent(APRTooltip, {
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

    it('Should show staking rewards as a single line item if min and max are the same', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        stakingApr: {
          min: 763,
          max: 763,
        },
        protocolApr: 0,
        min: 763,
        max: 763,
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: EmptyPoolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('staking-apr').textContent).toBe('7.63% Staking APR');
    });
  });

  describe('Token Aprs', () => {
    it('Should show stETH token APRs', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        tokenAprs: {
          total: 166,
          breakdown: {
            [configService.network.addresses.wstETH]: 166,
          },
        },
        min: 166,
        max: 166,
      };
      const poolMock: Pool = {
        ...EmptyPoolMock,
        tokensList: [configService.network.addresses.wstETH],
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: poolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe('Total APR1.66%');
      expect(getByTestId('yield-apr').textContent).toBe('1.66% Token APR');
    });

    it('Should show stMATIC token APRs', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        tokenAprs: {
          total: 153,
          breakdown: {
            '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4': 153,
          },
        },
        min: 153,
        max: 153,
      };
      const poolMock: Pool = {
        ...EmptyPoolMock,
        tokensList: [configService.network.addresses.stMATIC],
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: poolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe('Total APR1.53%');
      expect(getByTestId('yield-apr').textContent).toBe('1.53% stMATIC APR');
    });

    it('Should show rETH token APRs', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        swapFees: 29,
        tokenAprs: {
          total: 73,
          breakdown: {
            [configService.network.addresses.rETH]: 73,
          },
        },
        min: 102,
        max: 102,
      };
      const poolMock: Pool = {
        ...EmptyPoolMock,
        tokensList: [configService.network.addresses.rETH],
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: poolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe('Total APR1.02%');
      expect(getByTestId('yield-apr').textContent).toBe('0.73% Token APR');
    });

    it('Should show multiple token APRs with a generic header', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        swapFees: 48,
        tokenAprs: {
          total: 254,
          breakdown: {
            '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0': 118,
            '0xac3E018457B222d93114458476f3E3416Abbe38F': 104,
            '0xae78736Cd615f374D3085123A210448E74Fc6393': 32,
          },
        },
        min: 102,
        max: 102,
      };
      const poolMock: Pool = {
        ...EmptyPoolMock,
        tokensList: [configService.network.addresses.rETH],
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: poolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe('Total APR1.02%');
      const yieldAprBreakdown = getByTestId('yield-apr').children[0];
      expect(yieldAprBreakdown.children[0].textContent).toBe('2.54% Token APR');
      expect(yieldAprBreakdown.children[1].children[0].textContent).toBe(
        '1.18% wstETH APR'
      );
      expect(yieldAprBreakdown.children[1].children[1].textContent).toBe(
        '1.04% sfrxETH APR'
      );
      expect(yieldAprBreakdown.children[1].children[2].textContent).toBe(
        '0.32% rETH APR'
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
      const { getByTestId } = renderComponent(APRTooltip, {
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
      const { getByTestId } = renderComponent(APRTooltip, {
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
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: EmptyPoolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe('Total APR0.17%');
      expect(getByTestId('yield-apr').textContent).toBe('0.17% veBAL APR');
    });
  });

  describe('Staking Reward APRs', () => {
    it('Should show BAL Breakdown + additional staking rewards together', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        stakingApr: {
          min: 44,
          max: 522,
        },
        rewardAprs: {
          total: 123,
          breakdown: {
            '0xc3c7d422809852031b44ab29eec9f1eff2a58756': 123,
          },
        },
        min: 167,
        max: 645,
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: EmptyPoolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(getByTestId('total-apr').textContent).toBe(
        'Total APR1.67% - 6.45%'
      );
      expect(getByTestId('swap-fee-apr').textContent).toBe(
        '0.00% Swap fees APR'
      );
      expect(
        getByTestId('staking-apr').children[0].children[0].textContent
      ).toBe('1.67% Min staking APR');
      expect(
        getByTestId('staking-apr').children[0].children[1].children[0]
          .textContent
      ).toBe('0.44% Min BAL APR');
      expect(
        getByTestId('staking-apr').children[0].children[1].children[1]
          .textContent
      ).toBe('5.22% Max BAL APR');
      expect(
        getByTestId('staking-apr').children[0].children[1].children[2]
          .textContent
      ).toBe('1.23% Rewards APR');
    });

    it('Should show BAL + staking rewards as line items if staking APR is the same but there are rewards', () => {
      const aprBreakdown: AprBreakdown = {
        ...EmptyAprBreakdownMock,
        stakingApr: {
          min: 763,
          max: 763,
        },
        rewardAprs: {
          total: 288,
          breakdown: {
            '0xc3c7d422809852031b44ab29eec9f1eff2a58756': 288,
          },
        },
        min: 1051,
        max: 1051,
      };
      const { getByTestId } = renderComponent(APRTooltip, {
        props: {
          pool: EmptyPoolMock,
          poolApr: aprBreakdown,
        },
      });
      expect(
        getByTestId('staking-apr').children[0].children[0].textContent
      ).toBe('10.51% Staking APR');
      expect(
        getByTestId('staking-apr').children[0].children[1].children[0]
          .textContent
      ).toBe('7.63% BAL APR');
      expect(
        getByTestId('staking-apr').children[0].children[1].children[1]
          .textContent
      ).toBe('2.88% Rewards APR');
    });
  });
});
