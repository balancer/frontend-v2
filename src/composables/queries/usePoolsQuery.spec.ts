import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { initPoolsFallbackRepository } from '@/dependencies/PoolsFallbackRepository';
import {
  defaultPool1,
  defaultPool2,
} from '@/dependencies/PoolsFallbackRepository.mocks';
import {
  mountComposableWithFakeTokensProvider as mountComposable,
  waitForQueryData,
} from '@tests/mount-helpers';
import { anAprBreakdown } from '@tests/unit/builders/sdk-pool.builders';
import usePoolsQuery from './usePoolsQuery';

initDependenciesWithDefaultMocks();

async function mountPoolsQuery(poolsSortField = '') {
  const filterOptions = computed(() => ({ sortField: poolsSortField }));
  const { result } = await mountComposable(() =>
    usePoolsQuery(filterOptions, { enabled: true })
  );
  const data = await waitForQueryData(result);

  expect(data?.pages).toHaveLength(1);

  const firstPage = data?.pages[0];
  const firstPool = firstPage?.pools[0];
  const secondPool = firstPage?.pools[1];
  const poolAt = (index: number) => firstPage?.pools[index];

  return { firstPage, firstPool, secondPool, poolAt };
}
test('Returns a list of pools', async () => {
  const { firstPool, secondPool } = await mountPoolsQuery();

  expect(firstPool).toEqual(defaultPool1);
  expect(secondPool).toEqual(defaultPool2);
});

test('Filters by max apr', async () => {
  defaultPool1.apr = anAprBreakdown({ max: 5 });
  defaultPool2.apr = anAprBreakdown({ max: 10 });

  const sortField = 'apr';
  const { poolAt } = await mountPoolsQuery(sortField);

  expect(poolAt(0)).toEqual(defaultPool2);
  expect(poolAt(1)).toEqual(defaultPool1);

  //Change Apr to change sort order
  defaultPool2.apr = anAprBreakdown({ max: 3 });

  const { poolAt: poolAt2 } = await mountPoolsQuery(sortField);

  expect(poolAt2(0)).toEqual(defaultPool1);
  expect(poolAt2(1)).toEqual(defaultPool2);
});

test('Filters by totalSwapVolume', async () => {
  defaultPool1.totalSwapVolume = '99';
  defaultPool2.totalSwapVolume = '100';

  const sortField = 'volume';
  const { poolAt } = await mountPoolsQuery(sortField);

  expect(poolAt(0)).toEqual(defaultPool2);
  expect(poolAt(1)).toEqual(defaultPool1);

  //Change volume to change sort order
  defaultPool2.totalSwapVolume = '98';

  const { poolAt: poolAt2 } = await mountPoolsQuery(sortField);

  expect(poolAt2(0)).toEqual(defaultPool1);
  expect(poolAt2(1)).toEqual(defaultPool2);
});

test('Returns saved errors if there is an exception during fetching', async () => {
  class PoolsFallbackRepositoryMock {
    //@ts-ignore
    fetch() {
      throw new Error('Error during test');
    }
  }
  await mountPoolsQuery();

  //@ts-ignore
  initPoolsFallbackRepository(PoolsFallbackRepositoryMock);

  const { firstPage } = await mountPoolsQuery();
  expect(firstPage?.pools.length).toBeGreaterThan(2);
});
