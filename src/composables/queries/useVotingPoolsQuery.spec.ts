import { mapApiPoolType } from '@/composables/queries/useVotingPoolsQuery';
import { GqlPoolMinimalType } from '@/services/api/graphql/generated/api-types';
import { PoolType } from '@/services/pool/types';

test('Maps API pool types', async () => {
  expect(mapApiPoolType(GqlPoolMinimalType.Element)).toBe(PoolType.Element);
  expect(mapApiPoolType(GqlPoolMinimalType.Gyro3)).toBe(PoolType.Gyro3);
  expect(mapApiPoolType(GqlPoolMinimalType.Gyroe)).toBe(PoolType.GyroE);
  expect(mapApiPoolType(GqlPoolMinimalType.Investment)).toBe(
    PoolType.Investment
  );
  expect(mapApiPoolType(GqlPoolMinimalType.Linear)).toBe(PoolType.Linear);
  expect(mapApiPoolType(GqlPoolMinimalType.LiquidityBootstrapping)).toBe(
    PoolType.LiquidityBootstrapping
  );
  expect(mapApiPoolType(GqlPoolMinimalType.MetaStable)).toBe(
    PoolType.MetaStable
  );
  expect(mapApiPoolType(GqlPoolMinimalType.PhantomStable)).toBe(
    PoolType.StablePhantom
  );
  expect(mapApiPoolType(GqlPoolMinimalType.Stable)).toBe(PoolType.Stable);
  expect(mapApiPoolType(GqlPoolMinimalType.Unknown)).toBeNull();
  expect(mapApiPoolType(GqlPoolMinimalType.Weighted)).toBe(PoolType.Weighted);
});
