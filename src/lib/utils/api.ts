import {
  GqlChain,
  GqlPoolAprRange,
  GqlPoolAprTotal,
  GqlPoolFilterType,
  GqlPoolMinimalType,
} from '@/services/api/graphql/generated/api-types';
import { Network } from '@/lib/config/types';
import { PoolType } from '@/services/pool/types';
import BigNumber from 'bignumber.js';
import { bnum } from '.';

export function mapApiChain(
  apiChain: GqlChain | 'SEPOLIA' | 'GOERLI'
): Network {
  switch (apiChain) {
    case GqlChain.Arbitrum:
      return Network.ARBITRUM;
    case GqlChain.Avalanche:
      return Network.AVALANCHE;
    case GqlChain.Base:
      return Network.BASE;
    case GqlChain.Gnosis:
      return Network.GNOSIS;
    case GqlChain.Fantom:
      return Network.FANTOM;
    case GqlChain.Optimism:
      return Network.OPTIMISM;
    case GqlChain.Polygon:
      return Network.POLYGON;
    case GqlChain.Mainnet:
      return Network.MAINNET;
    case GqlChain.Zkevm:
      return Network.ZKEVM;
    case 'SEPOLIA':
      return Network.SEPOLIA;
    case 'GOERLI':
      return Network.GOERLI;

    default:
      throw new Error(`Unexpected API chain: ${apiChain}`);
  }
}

export function mapNetworkToApiChain(network: Network): GqlChain {
  switch (network) {
    case Network.ARBITRUM:
      return GqlChain.Arbitrum;
    case Network.AVALANCHE:
      return GqlChain.Avalanche;
    case Network.BASE:
      return GqlChain.Base;
    case Network.GNOSIS:
      return GqlChain.Gnosis;
    case Network.FANTOM:
      return GqlChain.Fantom;
    case Network.OPTIMISM:
      return GqlChain.Optimism;
    case Network.POLYGON:
      return GqlChain.Polygon;
    case Network.MAINNET:
      return GqlChain.Mainnet;
    case Network.ZKEVM:
      return GqlChain.Zkevm;

    default:
      throw new Error(`Unexpected Network: ${network}`);
  }
}

export function mapApiPoolType(
  apiPoolType: GqlPoolMinimalType
): PoolType | null {
  switch (apiPoolType) {
    case GqlPoolMinimalType.Element:
      return PoolType.Element;
    case GqlPoolMinimalType.Gyro3:
      return PoolType.Gyro3;
    case GqlPoolMinimalType.Gyroe:
      return PoolType.GyroE;
    case GqlPoolMinimalType.Investment:
      return PoolType.Investment;
    case GqlPoolMinimalType.Linear:
      return PoolType.Linear;
    case GqlPoolMinimalType.LiquidityBootstrapping:
      return PoolType.LiquidityBootstrapping;
    case GqlPoolMinimalType.MetaStable:
      return PoolType.MetaStable;
    case GqlPoolMinimalType.PhantomStable:
      return PoolType.StablePhantom;
    case GqlPoolMinimalType.Stable:
      return PoolType.Stable;
    case GqlPoolMinimalType.Weighted:
      return PoolType.Weighted;
    default:
      return null;
  }
}

export function mapPoolTypeToApiType(
  poolType: PoolType | string
): GqlPoolFilterType {
  switch (poolType) {
    case PoolType.Element:
      return GqlPoolFilterType.Element;
    case PoolType.Gyro2:
      return GqlPoolFilterType.Gyro3;
    case PoolType.Gyro3:
      return GqlPoolFilterType.Gyro3;
    case PoolType.GyroE:
      return GqlPoolFilterType.Gyroe;
    case PoolType.Investment:
      return GqlPoolFilterType.Investment;
    case PoolType.EulerLinear:
      return GqlPoolFilterType.Linear;
    case PoolType.Linear:
      return GqlPoolFilterType.Linear;
    case PoolType.LiquidityBootstrapping:
      return GqlPoolFilterType.LiquidityBootstrapping;
    case PoolType.MetaStable:
      return GqlPoolFilterType.MetaStable;
    case PoolType.StablePhantom:
      return GqlPoolFilterType.PhantomStable;
    case PoolType.Stable:
      return GqlPoolFilterType.Stable;
    case PoolType.ComposableStable:
      return GqlPoolFilterType.Stable;
    case PoolType.FX:
      return GqlPoolFilterType.Stable;
    case PoolType.Weighted:
      return GqlPoolFilterType.Weighted;
    default:
      throw new Error(`Unexpected Pool Type ${poolType}`);
  }
}

function isAprRange(obj: any): obj is GqlPoolAprRange {
  return obj.min !== undefined;
}

function isAprTotal(obj: any): obj is GqlPoolAprTotal {
  return obj.total !== undefined;
}

export function aprMinOrTotal(
  apr: GqlPoolAprRange | GqlPoolAprTotal
): BigNumber {
  if (isAprRange(apr)) {
    return bnum(apr.min);
  }
  if (isAprTotal(apr)) {
    return bnum(apr.total);
  }
  return bnum(0);
}

export function aprMaxOrTotal(
  apr: GqlPoolAprRange | GqlPoolAprTotal
): BigNumber {
  if (isAprRange(apr)) {
    return bnum(apr.max);
  }
  if (isAprTotal(apr)) {
    return bnum(apr.total);
  }
  return bnum(0);
}
