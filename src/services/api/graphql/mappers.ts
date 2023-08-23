import { Network } from '@/lib/config/types';
import { PoolType } from '@/services/pool/types';
import { GqlChain, GqlPoolMinimalType } from './generated/api-types';

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
