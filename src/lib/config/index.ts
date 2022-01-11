import homestead from './homestead.json';
import kovan from './kovan.json';
import rinkeby from './rinkeby.json';
import polygon from './polygon.json';
import arbitrum from './arbitrum.json';
import docker from './docker.json';
import test from './test.json';
import { Network } from '@/composables/useNetwork';

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
  poolsUrlV1: string;
  poolsUrlV2: string;
  subgraphs: {
    aave: string;
  };
  supportsEIP1559: boolean;
  supportsElementPools: boolean;
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
    exchangeProxy: string;
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
  };
  pools: {
    staBAL3: string;
    bbAaveUSD: string;
  };
  keys: {
    infura: string;
    alchemy: string;
  };
  strategies: Record<
    string,
    {
      type: string;
      name: string;
    }
  >;
}

const config: Record<Config['chainId'], Config> = {
  [Network.MAINNET]: homestead,
  [Network.KOVAN]: kovan,
  [Network.RINKEBY]: rinkeby,
  [Network.POLYGON]: polygon,
  [Network.ARBITRUM]: arbitrum,
  12345: test,
  // @ts-ignore
  17: docker
};

export default config;
