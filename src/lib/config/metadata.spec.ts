import { boostedPoolId } from '@/lib/config/goerli/pools';
import { poolMetadata } from './metadata';
import { PoolFeature } from '@/types/pools';

test('returns undefined when there is no pool metadata', async () => {
  expect(poolMetadata('inventedId')).toBeUndefined();
});

test('returns existing pool metadata', async () => {
  expect(poolMetadata(boostedPoolId)).toEqual({
    name: 'Balancer Boosted Aave USD',
    hasIcon: false,
    features: {
      [PoolFeature.Boosted]: {},
    },
  });
});
