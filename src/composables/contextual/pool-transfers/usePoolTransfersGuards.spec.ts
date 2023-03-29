import { defaultWeightedPoolId } from './../../../__mocks__/weighted-pool';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { Pool } from '@/services/pool/types';
import { mountComposableWithFakeTokensProvider } from '@tests/mount-helpers';
import { aPool, aVeBalPool } from '@tests/unit/builders/pool.builders';
import { createRouter, createWebHistory } from 'vue-router';
import waitForExpect from 'wait-for-expect';
import usePoolTransfersGuard from './usePoolTransfersGuard';

//TODO: setup https://github.com/posva/vue-router-mock
const mockRouter = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/blank',
      name: 'test route',
      component: {},
    },
    {
      path: '/:id/:networkSlug?',
      name: 'pool',
      component: {},
    },
  ],
});

initDependenciesWithDefaultMocks();

async function mountTransferGuards(pool: Pool) {
  poolsStoreService.setPools([pool]);

  // fake router params
  mockRouter.currentRoute.value.params = {
    id: pool.id,
  };
  mockRouter.push = vi.fn();
  const { result } = await mountComposableWithFakeTokensProvider(
    () => usePoolTransfersGuard(),
    { routerMock: mockRouter }
  );
  return result.transfersAllowed;
}

test('Allows transfer to non blocked pool', async () => {
  const veBalPool = aVeBalPool();

  const transfersAllowed = await mountTransferGuards(veBalPool);

  expect(transfersAllowed.value).toBeTrue();
});

test('Blocks pools with totalShares 0)', async () => {
  const pool = aPool({
    id: defaultWeightedPoolId,
    totalShares: '0',
  });

  const transfersAllowed = await mountTransferGuards(pool);

  await waitForExpect(() => {
    expect(transfersAllowed.value).toBeFalse();
  });

  expect(mockRouter.push).toHaveBeenCalledWith({
    name: 'pool',
    params: {
      id: defaultWeightedPoolId,
      networkSlug: 'goerli',
    },
  });
});

test('Blocks pools with created timestamp > 12pm UTC today (29th March)', async () => {
  const blockedTimestamp = Date.parse('2023-03-30');
  // const blockedTimestamp = 1680091200; // 12pm UTC today (29th March)

  const pool = aPool({
    id: defaultWeightedPoolId,
    createTime: blockedTimestamp,
  });

  const transfersAllowed = await mountTransferGuards(pool);

  await waitForExpect(() => {
    expect(transfersAllowed.value).toBeFalse();
  });

  expect(mockRouter.push).toHaveBeenCalledWith({
    name: 'pool',
    params: {
      id: defaultWeightedPoolId,
      networkSlug: 'goerli',
    },
  });
});
