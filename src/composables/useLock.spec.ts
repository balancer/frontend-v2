import waitForExpect from 'wait-for-expect';
import { mountComposable } from '@tests/mount-helpers';

import { useLock } from '@/composables/useLock';
import {
  defaultLockedAmount,
  initMulticallerWithDefaultMocks,
} from '@/dependencies/Multicaller.mocks';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { veBalPool } from '@/__mocks__/veBal-pool';

vi.mock('@/providers/tokens.provider');
vi.mock('@ethersproject/address');

initMulticallerWithDefaultMocks();

poolsStoreService.setPools([veBalPool]);

test('returns veBal locked amount', async () => {
  const { result } = mountComposable(() => useLock());

  expect(result.isLoadingLock.value).toBeTrue();
  await waitForExpect(() => expect(result.isLoadingLock.value).toBeFalse());

  expect(result.lock.value?.lockedAmount).toBe(defaultLockedAmount);
});
