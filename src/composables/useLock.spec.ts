import waitForExpect from 'wait-for-expect';
import { mountComposable } from '@tests/mount-helpers';

import { useLock } from '@/composables/useLock';
import {
  defaultLockedAmount,
  initMulticallerWithDefaultMocks,
} from '@/dependencies/Multicaller.mocks';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { aVeBalPool } from '@tests/unit/builders/pool.builders';

vi.mock('@/providers/tokens.provider');
vi.mock('@ethersproject/address');

initMulticallerWithDefaultMocks();

poolsStoreService.setPools([aVeBalPool()]);

test('returns veBal locked amount', async () => {
  const { result } = mountComposable(() => useLock());

  expect(result.isLoadingLock.value).toBeTrue();
  await waitForExpect(() => expect(result.isLoadingLock.value).toBeFalse());

  expect(result.lock.value?.lockedAmount).toBe(defaultLockedAmount);
});
