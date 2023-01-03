import { ref } from 'vue';
import { mount } from 'vue-composable-tester';
import { useUserPoolPercentage } from './useUserPoolPercentage';
import { aPool } from '@tests/unit/builders/pool.builders';

const stakedShares = '5';
const bptBalance = '10';

vi.mock('@/composables/staking/useStaking', () => {
  return {
    default: () => {
      return {
        userData: {
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

it('calculates user pool percentage', () => {
  const pool = aPool({ totalLiquidity: '100', totalShares: '100' });
  const { result } = mount(() => useUserPoolPercentage(pool));
  expect(result.userPoolPercentage.value.toString()).toBe('15');
});

it('calculates user pool percentage label', () => {
  const pool = aPool({ totalLiquidity: '8888888', totalShares: '100' });
  const { result } = mount(() => useUserPoolPercentage(pool));
  expect(result.userPoolPercentageLabel.value.toString()).toBe('0.00017%');
});

it('calculates user pool percentage label when user has a very small share', () => {
  const pool = aPool({ totalLiquidity: '88888888888', totalShares: '100' });
  const { result } = mount(() => useUserPoolPercentage(pool));
  expect(result.userPoolPercentageLabel.value.toString()).toBe('< 0.0001%');
});
