import { Network } from '@/lib/config/types';
import { PoolType } from '@/services/pool/types';
import {
  GqlChain,
  GqlPoolMinimalType as GqlPoolType,
} from './generated/api-types';

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

export function mapApiPoolType(apiPoolType: GqlPoolType): PoolType | null {
  switch (apiPoolType) {
    case GqlPoolType.Element:
      return PoolType.Element;
    case GqlPoolType.Gyro3:
      return PoolType.Gyro3;
    case GqlPoolType.Gyroe:
      return PoolType.GyroE;
    case GqlPoolType.Investment:
      return PoolType.Investment;
    case GqlPoolType.Linear:
      return PoolType.Linear;
    case GqlPoolType.LiquidityBootstrapping:
      return PoolType.LiquidityBootstrapping;
    case GqlPoolType.MetaStable:
      return PoolType.MetaStable;
    case GqlPoolType.PhantomStable:
      return PoolType.StablePhantom;
    case GqlPoolType.Stable:
      return PoolType.Stable;
    case GqlPoolType.Weighted:
      return PoolType.Weighted;
    default:
      return null;
  }
}
