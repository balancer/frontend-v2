import { initMulticallerAsPoolMulticallerMock } from '@/dependencies/Multicaller.mocks';
import {
  aWeightedPool,
  defaultWeightedPoolAddress,
} from '@/__mocks__/weighted-pool';
import { PoolMulticaller } from './pool.multicaller';

initMulticallerAsPoolMulticallerMock();

test('returns onchain pool data', async () => {
  const poolMulticaller = new PoolMulticaller([aWeightedPool()]);
  const onChainMap = await poolMulticaller.fetch();

  expect(onChainMap[defaultWeightedPoolAddress]).toBeDefined();
});
