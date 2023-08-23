import { Network } from '@/lib/config/types';
import {
  GqlChain,
  GqlPoolMinimalType,
} from '@/services/api/graphql/generated/api-types';
import { mapApiChain, mapApiPoolType } from '@/services/api/graphql/mappers';
import { PoolType } from '@/services/pool/types';

test('Maps API Chains', async () => {
  expect(mapApiChain(GqlChain.Arbitrum)).toBe(Network.ARBITRUM);
  expect(mapApiChain(GqlChain.Avalanche)).toBe(Network.AVALANCHE);
  expect(mapApiChain(GqlChain.Base)).toBe(Network.BASE);
  expect(mapApiChain(GqlChain.Fantom)).toBe(Network.FANTOM);
  expect(mapApiChain(GqlChain.Gnosis)).toBe(Network.GNOSIS);
  expect(mapApiChain(GqlChain.Mainnet)).toBe(Network.MAINNET);
  expect(mapApiChain(GqlChain.Optimism)).toBe(Network.OPTIMISM);
  expect(mapApiChain(GqlChain.Polygon)).toBe(Network.POLYGON);
  expect(mapApiChain(GqlChain.Zkevm)).toBe(Network.ZKEVM);

  expect(mapApiChain('GOERLI')).toBe(Network.GOERLI);
  expect(mapApiChain('SEPOLIA')).toBe(Network.SEPOLIA);
});

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
