import { Network } from '@balancer-labs/sdk';

import arbitrum from './arbitrum.json';
import docker from './docker.json';
import goerli from './goerli.json';
import homestead from './homestead.json';
import kovan from './kovan.json';
import optimism from './optimism.json';
import polygon from './polygon.json';
import rinkeby from './rinkeby.json';
import test from './test.json';

export interface Config {
  key: string;
  chainId: Network | 12345 | 17;
  chainName: string;
  name: string;
  shortName: string;
  network: string;
  portisNetwork?: string;
  unknown: boolean;
  rpc: string;
  publicRpc?: string;
  ws: string;
  loggingRpc: string;
  explorer: string;
  explorerName: string;
  subgraph: string;
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
    multicall: string;
    vault: string;
    weightedPoolFactory: string;
    stablePoolFactory: string;
    weth: string;
    stETH: string;
    wstETH: string;
    lidoRelayer: string;
    balancerHelpers: string;
    batchRelayer: string;
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
  };
  keys: {
    infura: string;
    alchemy: string;
    graph?: string;
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
  [Network.MAINNET]: homestead,
  [Network.KOVAN]: kovan,
  [Network.GOERLI]: goerli,
  [Network.RINKEBY]: rinkeby,
  [Network.POLYGON]: polygon,
  [Network.ARBITRUM]: arbitrum,
  [Network.OPTIMISM]: optimism,
  12345: test,
  // @ts-ignore
  17: docker,
};

export default config;
