import { initMulticallerWithDefaultMocks } from '@/dependencies/Multicaller.mocks';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { mountComposable, provideFakePoolStaking } from '@tests/mount-helpers';
import { aPool, aVeBalPool } from '@tests/unit/builders/pool.builders';
import { ref } from 'vue';
import waitForExpect from 'wait-for-expect';
import { useUserPoolPercentage } from './useUserPoolPercentage';

initMulticallerWithDefaultMocks();

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

it('includes locked shares given a veBal pool', async () => {
  const veBalPool = aVeBalPool({
    totalLiquidity: '100',
    totalShares: '100',
  });

  poolsStoreService.setPools([veBalPool]);

  const { result } = mountComposable(
    () => useUserPoolPercentage(ref(veBalPool)),
    // Locked pool does not have stacking
    { extraProvidersCb: () => provideFakePoolStaking('0') }
  );
  expect(result.userPoolPercentageLabel.value.toString()).toBe('10%');

  await waitForExpect(
    () => expect(result.userPoolPercentageLabel.value.toString()).toBe('11%')
    // expect(result.userPoolPercentageLabel.value.toString()).toBe('10.5%')
  );
});
