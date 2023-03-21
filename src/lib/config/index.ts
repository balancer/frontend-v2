import { Network } from '@balancer-labs/sdk';
import { Pools } from '@/constants/pools';

import arbitrum from './arbitrum';
import docker from './docker';
import goerli from './goerli';
import mainnet from './mainnet';
import optimism from './optimism';
import polygon from './polygon';
import gnosisChain from './gnosis-chain';
import test from './test';

export interface Config {
  key: string;
  chainId: Network | 12345 | 17;
  chainName: string;
  name: string;
  shortName: string;
  slug: string;
  network: string;
  unknown: boolean;
  rpc: string;
  publicRpc?: string;
  ws: string;
  explorer: string;
  explorerName: string;
  subgraph: string;
  balancerApi?: string;
  poolsUrlV2: string;
  subgraphs: {
    main: string[];
    aave: string;
    gauge: string;
    blocks: string;
  };
  supportsEIP1559: boolean;
  supportsElementPools: boolean;
  blockTime: number;
  nativeAsset: {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    deeplinkId: string;
    logoURI: string;
    minTransactionBuffer: string;
  };
  addresses: {
    merkleRedeem: string;
    merkleOrchard: string;
    merkleOrchardV2?: string;
    multicall: string;
    vault: string;
    weightedPoolFactory: string;
    stablePoolFactory: string;
    weth: string;
    rETH: string;
    stMATIC: string;
    stETH: string;
    wstETH: string;
    lidoRelayer: string;
    balancerHelpers: string;
    batchRelayer: string;
    batchRelayerV4: string;
    veBAL: string;
    gaugeController: string;
    gaugeFactory: string;
    balancerMinter: string;
    tokenAdmin: string;
    veDelegationProxy: string;
    veBALHelpers: string;
    feeDistributor: string;
    feeDistributorDeprecated: string;
    faucet: string;
    gaugeRewardsHelper?: string;
  };
  pools: Pools;
  keys: {
    infura?: string;
    alchemy?: string;
    graph?: string;
    balancerApi?: string;
  };
  strategies: Record<
    string,
    {
      type: string;
      name: string;
    }
  >;
  gauges: {
    type: number;
    weight: number;
  };
}

const config: Record<Network | number, Config> = {
  [Network.MAINNET]: mainnet,
  [Network.GOERLI]: goerli,
  [Network.POLYGON]: polygon,
  [Network.ARBITRUM]: arbitrum,
  [Network.OPTIMISM]: optimism,
  [Network.GNOSIS]: gnosisChain,
  12345: test,
  // @ts-ignore
  17: docker,
};

export default config;
