import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { Pool } from '@/services/pool/types';
import { BoostedPoolMock } from '@/__mocks__/boosted-pool';
import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import { aVeBalPool } from '@tests/unit/builders/pool.builders';
import { createRouter, createWebHistory } from 'vue-router';
import waitForExpect from 'wait-for-expect';
import useDisabledJoinsGuard from './useDisabledJoinsGuard';

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
  await mountComposable(() => useDisabledJoinsGuard(pool), {
    routerMock: mockRouter,
  });
}

describe('When checking disabled pool joins', () => {
  it('does not redirect where no disabled joins', async () => {
    const veBalPool = aVeBalPool();
    veBalPool.priceRateProviders = [];

    await mountTransferGuards(veBalPool);

    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('redirects when disabled joins', async () => {
    const pool = BoostedPoolMock;

    pool.totalShares = '0'; // joins disabled because noInitLiquidity is true

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
