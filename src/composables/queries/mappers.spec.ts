import { Network } from '@/lib/config/types';
import {
  GqlChain,
  GqlPoolMinimalType as GqlPoolType,
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
  expect(mapApiPoolType(GqlPoolType.Element)).toBe(PoolType.Element);
  expect(mapApiPoolType(GqlPoolType.Gyro3)).toBe(PoolType.Gyro3);
  expect(mapApiPoolType(GqlPoolType.Gyroe)).toBe(PoolType.GyroE);
  expect(mapApiPoolType(GqlPoolType.Investment)).toBe(PoolType.Investment);
  expect(mapApiPoolType(GqlPoolType.Linear)).toBe(PoolType.Linear);
  expect(mapApiPoolType(GqlPoolType.LiquidityBootstrapping)).toBe(
    PoolType.LiquidityBootstrapping
  );
  expect(mapApiPoolType(GqlPoolType.MetaStable)).toBe(PoolType.MetaStable);
  expect(mapApiPoolType(GqlPoolType.PhantomStable)).toBe(
    PoolType.StablePhantom
  );
  expect(mapApiPoolType(GqlPoolType.Stable)).toBe(PoolType.Stable);
  expect(mapApiPoolType(GqlPoolType.Unknown)).toBeNull();
  expect(mapApiPoolType(GqlPoolType.Weighted)).toBe(PoolType.Weighted);
});
