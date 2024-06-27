import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';

import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import { Network } from '@/lib/config/types';
import { GqlChain } from '@/services/api/graphql/generated/api-types';
import { LocationQuery, createRouter, createWebHistory } from 'vue-router';
import { aVotingPool } from '../../MultiVoting/voting-pool.builders';
import { useLMVotingFilters } from './useLMVotingFilters';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';

initDependenciesWithDefaultMocks();

function buildRouterMock() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/blank',
        name: 'test route',
        component: {},
      },
    ],
  });

  // fake router params
  router.currentRoute.value.params = {};
  router.push = vi.fn();

  function setRouteQuery(chain: LocationQuery) {
    router.currentRoute.value.query = chain;
  }

  return { router, setRouteQuery };
}

async function mountLmVotingFilters(
  votingPools: ComputedRef<VotingPool[]>,
  expiredGauges: Ref<readonly string[] | undefined>,
  routerMock = buildRouterMock().router
) {
  const { result } = await mountComposable(
    () => useLMVotingFilters(votingPools, expiredGauges),
    { routerMock }
  );
  return result;
}

const expiredGauges = ref([]);

it('empty filters by default', async () => {
  const votingPools = computed(() => [aVotingPool()]);
  const { activeNetworkFilters } = await mountLmVotingFilters(
    votingPools,
    expiredGauges
  );
  expect(activeNetworkFilters.value).toEqual([]);
});

it('when the url chain filter in the query string', async () => {
  const { router, setRouteQuery } = buildRouterMock();
  setRouteQuery({ chain: 'arbitrum' });

  const anArbitrumPool = aVotingPool({
    network: Network.ARBITRUM,
  });
  const anMainnetPool = aVotingPool({ chain: GqlChain.Mainnet });

  const votingPools = computed(() => [anArbitrumPool, anMainnetPool]);

  const { activeNetworkFilters, filteredVotingPools } =
    await mountLmVotingFilters(votingPools, expiredGauges, router);

  expect(activeNetworkFilters.value).toEqual([42161]);
  expect(filteredVotingPools.value).toEqual([anArbitrumPool]);
});

it('filters by token symbol', async () => {
  const { router, setRouteQuery } = buildRouterMock();
  setRouteQuery({});
  const aVotingPoolWithGoldToken = aVotingPool();
  aVotingPoolWithGoldToken.tokens[0].symbol = 'Gold';

  const votingPools = computed(() => [
    aVotingPoolWithGoldToken,
    aVotingPool({ tokens: [] }),
  ]);

  const { filteredVotingPools, tokenFilter, activeNetworkFilters } =
    await mountLmVotingFilters(votingPools, expiredGauges, router);

  tokenFilter.value = 'Gol';

  expect(activeNetworkFilters.value).toEqual([]);

  expect(filteredVotingPools.value).toEqual([aVotingPoolWithGoldToken]);
});

it('calculates networkFilters', async () => {
  const { networkFilters } = await mountLmVotingFilters(
    computed(() => []),
    expiredGauges
  );

  expect(networkFilters).toEqual([
    1, 10, 100, 137, 252, 1101, 8453, 42161, 43114,
  ]);
});
