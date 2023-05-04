import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import {
  initMulticallerAsPoolMulticallerMock,
  initMulticallPoolId,
} from '@/dependencies/Multicaller.mocks';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { mountComposableWithDefaultTokensProvider as mountComposable } from '@tests/mount-helpers';
import { aVeBalPool } from '@tests/unit/builders/pool.builders';
import waitForExpect from 'wait-for-expect';
import { poolProvider } from './pool.provider';

initDependenciesWithDefaultMocks();
initMulticallerAsPoolMulticallerMock();

async function mountUserPoolProvider(poolId: string) {
  const { result } = mountComposable(() => poolProvider(poolId));

  await waitForExpect(() => {
    expect(result.isLoadingPool.value).toBeFalse();
  });

  return result;
}

test('returns pool from store service', async () => {
  const veBalPool = aVeBalPool();
  initMulticallPoolId(veBalPool.id);
  poolsStoreService.setPools([veBalPool]);
  const { pool } = await mountUserPoolProvider(veBalPool.id);

  expect(pool.value?.id).toEqual(veBalPool.id);
});

test('refetches onchain pool data', async () => {
  const veBalPool = aVeBalPool();
  poolsStoreService.setPools([veBalPool]);
  const { refetchOnchainPoolData, pool } = await mountUserPoolProvider(
    veBalPool.id
  );

  await refetchOnchainPoolData();
  expect(pool.value?.id).toEqual(veBalPool.id);
});
