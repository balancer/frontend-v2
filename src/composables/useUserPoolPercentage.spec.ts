import { ref } from 'vue';
import { useUserPoolPercentage } from './useUserPoolPercentage';
import { aPool } from '@tests/unit/builders/pool.builders';
import { mountComposable } from '@tests/mount-helpers';

const bptBalance = '10';

vi.mock('@/providers/tokens.provider', () => {
  return {
    useTokens() {
      return { balanceFor: () => bptBalance };
    },
  };
});

it('calculates user pool percentage', () => {
  const pool = aPool({ totalLiquidity: '100', totalShares: '100' });
  const { result } = mountComposable(() => useUserPoolPercentage(ref(pool)));
  expect(result.userPoolPercentage.value.toString()).toBe('15');
});

it('calculates user pool percentage label', () => {
  const pool = aPool({ totalLiquidity: '8888888', totalShares: '100' });
  const { result } = mountComposable(() => useUserPoolPercentage(ref(pool)));
  expect(result.userPoolPercentageLabel.value.toString()).toBe('0.00017%');
});

it('calculates user pool percentage label when user has a very small share', () => {
  const pool = aPool({ totalLiquidity: '88888888888', totalShares: '100' });
  const { result } = mountComposable(() => useUserPoolPercentage(ref(pool)));
  expect(result.userPoolPercentageLabel.value.toString()).toBe('< 0.0001%');
});
