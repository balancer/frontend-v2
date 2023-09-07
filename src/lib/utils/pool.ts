import { POOLS } from '@/constants/pools';
import { FactoryType } from '@/types/pools';
import { PoolType } from '@balancer-labs/sdk';

export function getPoolTypeFromFactoryAddress(
  factoryAddress: string
): PoolType {
  const poolFactory: FactoryType = POOLS.Factories[factoryAddress];
  switch (poolFactory) {
    case 'boostedPool':
      return PoolType.StablePhantom;
    case 'composableStablePool':
      return PoolType.ComposableStable;
    case 'erc4626Linear':
      return PoolType.ERC4626Linear;
    case 'eulerLinear':
      return PoolType.EulerLinear;
    case 'fx':
      return PoolType.FX;
    case 'gyroE':
      return PoolType.GyroE;
    case 'liquidityBootstrappingPool':
      return PoolType.LiquidityBootstrapping;
    case 'managedPool':
      return PoolType.Managed;
    case 'oracleWeightedPool':
      return PoolType.Weighted;
    case 'stablePool':
      return PoolType.Stable;
    case 'weightedPool':
      return PoolType.Weighted;
  }

  return PoolType.Weighted;
}
