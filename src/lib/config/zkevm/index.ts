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
  layerZeroChainId: 158,
  chainName: 'Polygon zkEVM',
  name: 'Polygon zkEVM Mainnet',
  shortName: 'zkEVM',
  monorepoName: 'zkevm',
  slug: 'zkevm',
  network: 'polygon-zkevm',
  trustWalletNetwork: 'polygonzkevm',
  unknown: false,
  visibleInUI: true,
  testNetwork: false,
  rpc: `https://polygonzkevm-mainnet.g.alchemy.com/v2/${keys.alchemy}`,
  ws: ``,
  publicRpc: 'https://zkevm-rpc.com',
  explorer: 'https://zkevm.polygonscan.com/',
  explorerName: 'Polygonscan',
  subgraph:
    'https://api.studio.thegraph.com/query/24660/balancer-polygon-zk-v2/version/latest',
  balancerApi: 'https://api.balancer.fi',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      'https://api.studio.thegraph.com/query/24660/balancer-polygon-zk-v2/version/latest',
    ],
    aave: '',
    gauge:
      'https://api.studio.thegraph.com/query/24660/balancer-gauges-polygon-zk/version/latest',
    blocks:
      'https://api.studio.thegraph.com/query/48427/bleu-polygon-zkevm-blocks/version/latest',
  },
  bridgeUrl: 'https://wallet.polygon.technology/zkEVM-Bridge/bridge',
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
