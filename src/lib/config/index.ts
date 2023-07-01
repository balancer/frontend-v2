import { Config } from './types';

import arbitrum from './arbitrum';
import docker from './docker';
import goerli from './goerli';
import mainnet from './mainnet';
import optimism from './optimism';
import polygon from './polygon';
import gnosisChain from './gnosis-chain';
import zkevm from './zkevm';
import test from './test';

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
}

const config: Record<Network | number, Config> = {
  [Network.MAINNET]: mainnet,
  [Network.GOERLI]: goerli,
  [Network.POLYGON]: polygon,
  [Network.ARBITRUM]: arbitrum,
  [Network.OPTIMISM]: optimism,
  [Network.GNOSIS]: gnosisChain,
  [Network.ZKEVM]: zkevm,
  // @ts-ignore
  12345: test,
  // @ts-ignore
  17: docker,
};

export default config;
