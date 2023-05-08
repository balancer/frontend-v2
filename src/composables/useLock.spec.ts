import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import waitForExpect from 'wait-for-expect';

import { useLock } from '@/composables/useLock';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { defaultLockedAmount } from '@/dependencies/Multicaller.mocks';
import { provideUserData } from '@/providers/user-data.provider';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { aVeBalPool } from '@tests/unit/builders/pool.builders';

initDependenciesWithDefaultMocks();

async function mountUseLock() {
  const { result } = await mountComposable(() => useLock(), {
    extraProvidersCb: () => provideUserData(),
  });
  return result;
}

const veBalPool = aVeBalPool({
  totalLiquidity: '1000',
  totalShares: '100',
});
poolsStoreService.setPools([veBalPool]);

test('returns veBal locked amount', async () => {
  const result = await mountUseLock();

  await waitForExpect(() => expect(result.isLoadingLock.value).toBeFalse());

  expect(result.lock.value?.lockedAmount).toBe(defaultLockedAmount);
});

test('returns totalLockedValue', async () => {
  const result = await mountUseLock();

  await waitForExpect(() => expect(result.isLoadingLock.value).toBeFalse());
});
