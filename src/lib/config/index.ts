import { Config } from './types';

import arbitrum from './arbitrum';
import goerli from './goerli';
import gnosisChain from './gnosis-chain';
import mainnet from './mainnet';
import optimism from './optimism';
import polygon from './polygon';
import zkevm from './zkevm';
import neonMainnet from './neon-mainnet';
import neonDevnet from './neon-devnet';

// We don't import Network from sdk to avoid extra bundle size when loading app (while the SDK is not tree-shakable)
export enum Network {
  MAINNET = 1,
  GOERLI = 5,
  GÖRLI = 5,
  OPTIMISM = 10,
  GNOSIS = 100,
  POLYGON = 137,
  FANTOM = 250,
  ZKEVM = 1101,
  ARBITRUM = 42161,
  NEON_MAINNET = 245022934,
  NEON_DEVNET = 245022926,
}

const config: Record<Network | number, Config> = {
  [Network.MAINNET]: mainnet,
  [Network.GOERLI]: goerli,
  [Network.POLYGON]: polygon,
  [Network.ARBITRUM]: arbitrum,
  [Network.OPTIMISM]: optimism,
  [Network.GNOSIS]: gnosisChain,
  [Network.ZKEVM]: zkevm,
  [Network.NEON_MAINNET]: neonMainnet,
  [Network.NEON_DEVNET]: neonDevnet,
};

export default config;
