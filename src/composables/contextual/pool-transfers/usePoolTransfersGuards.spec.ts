import { defaultWeightedPoolId } from './../../../__mocks__/weighted-pool';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { Pool } from '@/services/pool/types';
import { mountComposableWithFakeTokensProvider } from '@tests/mount-helpers';
import { aPool, aVeBalPool } from '@tests/unit/builders/pool.builders';
import { createRouter, createWebHistory } from 'vue-router';
import waitForExpect from 'wait-for-expect';
import usePoolTransfersGuard, {
  shouldBlockAccess,
} from './usePoolTransfersGuard';
import { toEpochTimestamp } from '@/lib/utils/time';

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

// usePoolTransfersGuard uses shouldBlockAccess to check if the pool must be blocked
// It is enough to test the 2 paths here (blocked and non-blocked) and delegate the testing of the combinations to the simpler shouldBlockAccess tests
describe('When checking blocked pools', () => {
  it('does not block a pool with shouldBlockAccess false', async () => {
    const veBalPool = aVeBalPool();

    const transfersAllowed = await mountTransferGuards(veBalPool);

    expect(transfersAllowed.value).toBeTrue();
  });

  it('blocks a pool with shouldBlockAccess true', async () => {
    const pool = aPool({
      id: defaultWeightedPoolId,
      totalShares: '0', // shouldBlockAccess is true because noInitLiquidity is true
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
});

//The 2 tests below cover the 2 composable flows (blocked/unblocked)
// The following tests cover all the concrete block rules
describe('When checking pool blocks', () => {
  it('blocks pool created after 29 March', async () => {
    expect(
      shouldBlockAccess(
        aPool({
          createTime: toEpochTimestamp('2023-03-30'),
        })
      )
    ).toBeTrue();
  });

  it('does not block pool created before 29 March', async () => {
    expect(
      shouldBlockAccess(
        aPool({
          createTime: toEpochTimestamp('2023-03-28'),
        })
      )
    ).toBeFalse();
  });

  it('blocks pool without creation date', async () => {
    expect(
      shouldBlockAccess(
        aPool({
          createTime: undefined,
        })
      )
    ).toBeTrue();
  });

  it('blocks pool without init liquidity (AKA totalShares 0)', async () => {
    expect(
      shouldBlockAccess(
        aPool({
          totalShares: '0',
        })
      )
    ).toBeTrue();
  });
  it('does not block pool with init liquidity (AKA totalShares > 0)', async () => {
    expect(
      shouldBlockAccess(
        aPool({
          totalShares: '1',
        })
      )
    ).toBeFalse();
  });
});
