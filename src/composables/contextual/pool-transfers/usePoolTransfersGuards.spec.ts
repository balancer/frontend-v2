import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { Pool } from '@/services/pool/types';
import { BoostedPoolMock } from '@/__mocks__/boosted-pool';
import { mountComposableWithFakeTokensProvider } from '@tests/mount-helpers';
import { aVeBalPool } from '@tests/unit/builders/pool.builders';
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
  await mountComposableWithFakeTokensProvider(() => usePoolTransfersGuard(), {
    routerMock: mockRouter,
  });
}

// usePoolTransfersGuard uses shouldBlockAccess to check if the pool must be blocked
// It is enough to test the 2 paths here (blocked and non-blocked) and delegate the testing of the combinations to the simpler shouldBlockAccess tests
describe('When evaluating blocked pools redirects', () => {
  it('does not redirect a non blocked pool', async () => {
    const veBalPool = aVeBalPool();

    await mountTransferGuards(veBalPool);

    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it.only('redirects when a pool is blocked', async () => {
    const pool = BoostedPoolMock;

    pool.totalShares = '0'; // blocks pool because noInitLiquidity is true

    await mountTransferGuards(pool);

    await waitForExpect(() =>
      expect(mockRouter.push).toHaveBeenCalledWith({
        name: 'pool',
        params: {
          id: pool.id,
          networkSlug: 'goerli',
        },
      })
    );
  });
});
