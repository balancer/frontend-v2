import { boostedPoolId } from '@/lib/config/goerli/pools';
import { poolMetadata } from './metadata';

test('returns undefined when there is no pool metadata', async () => {
  expect(poolMetadata('inventedId')).toBeUndefined();
});

test('returns existing pool metadata', async () => {
  expect(poolMetadata(boostedPoolId)).toEqual({
    hasIcon: false,
    name: 'Balancer Boosted Aave USD',
    boosted: true,
  });
});
