import usePoolQuery from '@/composables/queries/usePoolQuery';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import {
  mountComposableWithDefaultTokensProvider,
  waitForQueryData,
} from '@tests/mount-helpers';
import { aVeBalPool } from '@tests/unit/builders/pool.builders';

initDependenciesWithDefaultMocks();

test('Returns already downloaded pool (recovered by poolsStoreService)', async () => {
  const veBalPool = aVeBalPool();
  poolsStoreService.setPools([veBalPool]);

  const { result } = mountComposableWithDefaultTokensProvider(() =>
    usePoolQuery(veBalPool.id, ref(true))
  );

  const data = await waitForQueryData(result);

  expect(data?.id).toEqual(veBalPool.id);
  expect(data?.address).toEqual(veBalPool.address);
});
