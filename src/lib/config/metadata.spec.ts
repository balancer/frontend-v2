import { poolMetadata } from './metadata';

test('returns undefined when there is no pool metadata', async () => {
  expect(poolMetadata('inventedId')).toBeUndefined();
});

test('returns existing pool metadata', async () => {
  expect(
    poolMetadata(
      '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f'
    )
  ).toEqual({
    hasIcon: false,
    name: 'Balancer Boosted Aave USD',
  });
});
