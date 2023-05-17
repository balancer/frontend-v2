import { Config } from '../types';
import keys from './keys';
import contracts from './contracts';
import pools from './pools';
import tokenlists from './tokenlists';
import tokens from './tokens';
import rateProviders from './rateProviders';

const config: Config = {
  key: '1101',
  chainId: 1101,
  chainName: 'Polygon zkEVM',
  name: 'Polygon zkEVM Mainnet',
  shortName: 'zkEVM',
  slug: 'zkevm',
  network: 'polygon-zkevm',
  unknown: false,
  visibleInUI: false,
  testNetwork: false,
  rpc: `https://polygonzkevm-mainnet.g.alchemy.com/v2/${keys.alchemy}`,
  ws: ``,
  publicRpc: 'https://zkevm-rpc.com',
  explorer: 'https://zkevm.polygonscan.com/',
  explorerName: 'Polygonscan',
  subgraph:
    'https://api.studio.thegraph.com/query/24660/balancer-polygon-zkevm-v2/v0.0.2',
  balancerApi: 'https://api.balancer.fi',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      'https://api.studio.thegraph.com/query/24660/balancer-polygon-zkevm-v2/v0.0.2',
    ],
    aave: '',
    gauge: '',
    blocks: '',
  },
  bridgeUrl: 'https://wallet.polygon.technology/zkEVM-Bridge/bridge',
  supportsEIP1559: false,
  supportsElementPools: false,
  blockTime: 2,
  nativeAsset: {
    name: 'Ether',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'ETH',
    decimals: 18,
    deeplinkId: 'ether',
    logoURI: 'tokens/eth.png',
    minTransactionBuffer: '0.05',
  },
  thirdParty: {
    coingecko: {
      nativeAssetId: 'ethereum',
      platformId: 'polygon-zkevm',
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
