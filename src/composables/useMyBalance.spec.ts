import { ref } from 'vue';
import { mount } from 'vue-composable-tester';
import { useMyBalance } from './useMyBalance';

import { Pool } from '@/services/pool/types';
import { mock } from 'vitest-mock-extended';

const BoostedPoolMock = mock<Pool>();
BoostedPoolMock.totalLiquidity = '100';
BoostedPoolMock.totalShares = '100';
const stakedShares = '5';
const bptBalance = '10';

vi.mock('@/services/web3/useWeb3');
vi.mock('@/composables/staking/useStaking', () => {
  return {
    default: () => {
      return {
        userData: {
          // stakedSharesForProvidedPool: ref('0.002409248717971854'),
          stakedSharesForProvidedPool: ref(stakedShares),
        },
      };
    },
  };
});

vi.mock('@/composables/useTokens', () => {
  return {
    default: () => {
      return {
        balanceFor: () => bptBalance,
      };
    },
  };
});

const { result } = mount(() => useMyBalance(BoostedPoolMock));

describe('useMyBalance', () => {
  it('adds my bpt and my stacked shares to calculate bptBalance', () => {
    expect(result.bptBalance.value.toString()).toBe('15');
  });

  it('bptBalanceWithoutStaked', () => {
    expect(result.bptBalanceWithoutStaked.value.toString()).toBe('10');
  });

  it('poolLiquidity', () => {
    expect(result.poolLiquidity.value.toString()).toBe('100');
  });

  it('formattedFiatValue', () => {
    expect(result.formattedFiatValue.value.toString()).toBe('$15.00');
  });

  it('TDB', () => {
    expect(result.formattedTotalLiquidityFiatValue.value.toString()).toBe(
      '$100.00'
    );
    expect(result.fiatValue.value.toString()).toBe('15');
    expect(result.myPoolPercentage.value.toString()).toBe('15');
  });

  it('TDB2', () => {
    const applyMyPoolPercentageTo = (value: string): number =>
      (Number(value) * Number(result.myPoolPercentage.value)) / 100;

    expect(applyMyPoolPercentageTo('100')).toBe(15);
    expect(applyMyPoolPercentageTo('50')).toBe(7.5);
    expect(applyMyPoolPercentageTo('50')).toBe(7.5);
    expect(applyMyPoolPercentageTo('17148799.021266')).toBe(2572319.8531899);
  });
});

test('Generator', () => {
  const poolMock = mock<Pool>();
  poolMock.totalLiquidity = '100';

  // const data = generator.generate('Pool');
  console.log('CUCU', poolMock);
  console.log('totalLiquidity', poolMock.totalLiquidity);
  // console.log(data);
});
