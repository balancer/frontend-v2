import { Network } from '@/lib/config/types';
import { PoolType } from '@/services/pool/types';
import { GqlChain, GqlPoolType } from './generated/api-types';

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
    case GqlChain.Fraxtal:
      return Network.FRAXTAL;
    case GqlChain.Optimism:
      return Network.OPTIMISM;
    case GqlChain.Polygon:
      return Network.POLYGON;
    case GqlChain.Mainnet:
      return Network.MAINNET;
    case GqlChain.Mode:
      return Network.MODE;
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
    case GqlPoolType.LiquidityBootstrapping:
      return PoolType.LiquidityBootstrapping;
    case GqlPoolType.MetaStable:
      return PoolType.MetaStable;
    case GqlPoolType.Stable:
      return PoolType.Stable;
    case GqlPoolType.Weighted:
      return PoolType.Weighted;
    case GqlPoolType.PhantomStable:
      return PoolType.StablePhantom;
    case GqlPoolType.ComposableStable: // 20 Dec 2023: API change moving from PhantomStable to ComposableStable
      return PoolType.StablePhantom; // We can change this to PoolType.ComposableStable once our partners are ok

    default:
      return null;
  }
}
