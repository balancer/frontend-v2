import homestead from './homestead.json';
import kovan from './kovan.json';
import rinkeby from '../../beethovenx/config/rinkeby.json';
import polygon from './polygon.json';
import arbitrum from './arbitrum.json';
import fantom from '../../beethovenx/config/fantom.json';
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
    lbpFactory: string;
    stablePoolFactory: string;
    weth: string;
    stETH: string;
    wstETH: string;
    lidoRelayer: string;
    balancerHelpers: string;
    beethovenxToken: string;
    masterChef: string;
    earlyLudwigNft: string;
    beetsUsdcReferencePricePool: string;
    beets: string;
    usdc: string;
    defaultPoolOwner: string;
    copperProxy: string;
    batchRelayer: string;
    bbUsd: string;
  };
  usdTokens: string[];
  usdTokenToWrappedTokenMap: { [mainToken: string]: string };
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
  backendUrl: string;
  configSanityUrl: string;
  blockSubgraph: string;
  farmSubgraph: string;
  tokenListSanityUrl: string;
  fBeets: {
    address: string;
    poolId: string;
    poolAddress: string;
    farmId: string;
    oldFarmId: string;
  };
}

const config: Record<Config['chainId'], Config> = {
  //[Network.MAINNET]: homestead,
  //[Network.KOVAN]: kovan,
  [Network.RINKEBY]: rinkeby,
  //[Network.POLYGON]: polygon,
  //[Network.ARBITRUM]: arbitrum,
  [Network.FANTOM]: fantom,
  //12345: test,
  // @ts-ignore
  17: docker
};

export default config;
