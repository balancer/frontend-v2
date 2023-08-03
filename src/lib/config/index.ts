import { Config } from './types';

import arbitrum from './arbitrum';
import avalanche from './avalanche';
import base from './base';
import goerli from './goerli';
import gnosisChain from './gnosis-chain';
import mainnet from './mainnet';
import optimism from './optimism';
import polygon from './polygon';
import sepolia from './sepolia';
import zkevm from './zkevm';

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
  BASE = 8453,
  ARBITRUM = 42161,
  AVALANCHE = 43114,
  SEPOLIA = 11155111,
}

const config: Record<Network | number, Config> = {
  [Network.MAINNET]: mainnet,
  [Network.GOERLI]: goerli,
  [Network.POLYGON]: polygon,
  [Network.ARBITRUM]: arbitrum,
  [Network.OPTIMISM]: optimism,
  [Network.GNOSIS]: gnosisChain,
  [Network.ZKEVM]: zkevm,
  [Network.AVALANCHE]: avalanche,
  [Network.SEPOLIA]: sepolia,
  [Network.BASE]: base,
};

export default config;
