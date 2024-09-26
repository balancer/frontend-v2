import { Config } from '../types';
import keys from './keys';
import contracts from './contracts';
import pools from './pools';
import tokenlists from './tokenlists';
import tokens from './tokens';
import rateProviders from './rateProviders';

const config: Config = {
  key: '8453',
  chainId: 8453,
  layerZeroChainId: 184,
  chainName: 'Base',
  name: 'Base',
  shortName: 'Base',
  monorepoName: 'base',
  slug: 'base',
  slugV3: 'base',
  network: 'base',
  trustWalletNetwork: 'base',
  unknown: false,
  visibleInUI: true,
  testNetwork: false,
  rpc: `https://base-mainnet.infura.io/v3/${keys.infura}`,
  ws: ``,
  publicRpc: 'https://mainnet.base.org',
  explorer: 'https://basescan.org',
  explorerName: 'BaseScan',
  subgraph: `https://gateway.thegraph.com/api/${keys.graph}/subgraphs/id/E7XyutxXVLrp8njmjF16Hh38PCJuHm12RRyMt5ma4ctX`,
  balancerApi: 'https://api.balancer.fi',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      `https://gateway.thegraph.com/api/${keys.graph}/subgraphs/id/E7XyutxXVLrp8njmjF16Hh38PCJuHm12RRyMt5ma4ctX`,
    ],
    aave: '',
    gauge: `https://gateway.thegraph.com/api/${keys.graph}/subgraphs/id/CfBvJNYsbKZdxXzaCtNc6dUbHH6TjDupprjKKo9gnmwg`,
    blocks: `https://gateway.thegraph.com/api/${keys.graph}/subgraphs/id/CcK8LjrekkGuvBaic1Wo4xbi7eusGsgwT5cV4qRsKz4Z`,
  },
  bridgeUrl: 'https://bridge.base.org/',
  supportsEIP1559: false,
  supportsElementPools: false,
  supportsVeBalSync: true,
  blockTime: 2,
  nativeAsset: {
    name: 'Ether',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'ETH',
    decimals: 18,
    deeplinkId: 'ether',
    logoURI: 'tokens/eth.png',
    minTransactionBuffer: '0.005',
  },
  thirdParty: {
    coingecko: {
      nativeAssetId: 'ethereum',
      platformId: 'base',
    },
  },
  addresses: {
    ...contracts,
  },
  pools,
  tokens,
  keys,
  gauges: {
    type: 3,
    weight: 0,
  },
  tokenlists,
  rateProviders,
};

export default config;
